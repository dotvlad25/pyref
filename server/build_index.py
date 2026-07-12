"""
Ingest markdown articles -> SQLite (source of truth) -> export static search index.

Each article is a markdown file in content/articles/ with YAML frontmatter:

    ---
    id: lru-cache
    title: LRU Cache
    keywords: [lru, cache, ordereddict, doubly linked list]
    category: Data Structures
    related: [ordereddict, doubly-linked-list]
    ---
    # LRU Cache
    ...body (mostly python)...

Run:  python server/build_index.py
"""

import hashlib
import json
import os
import re
import sqlite3
import sys
from datetime import datetime, timezone

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTICLES_DIR = os.path.join(ROOT, "content", "articles")
DB_PATH = os.path.join(ROOT, "server", "reference.db")
INDEX_PATH = os.path.join(ROOT, "static", "index.json")

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.DOTALL)


def parse_article(path):
    """Return a dict for one markdown file, or raise ValueError with context."""
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()

    m = FRONTMATTER_RE.match(raw)
    if not m:
        raise ValueError(f"{os.path.basename(path)}: missing YAML frontmatter")

    meta = yaml.safe_load(m.group(1)) or {}
    body = m.group(2).strip()

    default_id = os.path.splitext(os.path.basename(path))[0]
    article_id = str(meta.get("id") or default_id).strip()
    title = str(meta.get("title") or "").strip()
    if not title:
        raise ValueError(f"{article_id}: missing 'title'")

    keywords = meta.get("keywords") or []
    if isinstance(keywords, str):
        keywords = [k.strip() for k in keywords.split(",") if k.strip()]
    keywords = [str(k).strip() for k in keywords]

    related = meta.get("related") or []
    if isinstance(related, str):
        related = [r.strip() for r in related.split(",") if r.strip()]
    related = [str(r).strip() for r in related]

    category = str(meta.get("category") or "Uncategorized").strip()

    # Hash of the full file (frontmatter + body): any edit invalidates a prior
    # audit, so an edited article automatically shows up as needing re-audit.
    content_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()

    return {
        "id": article_id,
        "title": title,
        "keywords": keywords,
        "category": category,
        "related": related,
        "body": body,
        "content_hash": content_hash,
    }


def init_db(conn):
    # `articles` is rebuilt from markdown on every run, so it's safe to drop and
    # recreate — this also migrates old schemas (e.g. adding content_hash).
    # `audit_log` is NEVER dropped: it's the persistent ledger.
    cols = [r[1] for r in conn.execute("PRAGMA table_info(articles)")]
    if cols and "content_hash" not in cols:
        conn.execute("DROP TABLE articles")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS articles (
            id           TEXT PRIMARY KEY,
            title        TEXT NOT NULL,
            keywords     TEXT NOT NULL,   -- JSON array
            category     TEXT NOT NULL,
            related      TEXT NOT NULL,   -- JSON array
            body         TEXT NOT NULL,
            content_hash TEXT NOT NULL,   -- sha256 of the full file
            updated_at   TEXT NOT NULL
        )
        """
    )
    # Persistent audit ledger. Kept in a SEPARATE table because `articles` is
    # wiped and rebuilt on every build; this one must survive. An article is
    # "audited" iff a row here has audited_hash == its current content_hash.
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_log (
            id            TEXT PRIMARY KEY,
            audited_hash  TEXT NOT NULL,   -- content_hash that was audited
            audited_at    TEXT NOT NULL,
            note          TEXT             -- optional: reviewer/run/summary
        )
        """
    )
    conn.commit()


def build():
    if not os.path.isdir(ARTICLES_DIR):
        print(f"No articles dir at {ARTICLES_DIR}", file=sys.stderr)
        sys.exit(1)

    paths = sorted(
        os.path.join(ARTICLES_DIR, f)
        for f in os.listdir(ARTICLES_DIR)
        if f.endswith(".md")
    )

    articles = []
    seen_ids = set()
    for p in paths:
        article = parse_article(p)
        if article["id"] in seen_ids:
            raise ValueError(f"Duplicate id: {article['id']} ({p})")
        seen_ids.add(article["id"])
        articles.append(article)

    now = datetime.now(timezone.utc).isoformat()

    # Write SQLite (source of truth) from scratch each build.
    conn = sqlite3.connect(DB_PATH)
    try:
        init_db(conn)
        conn.execute("DELETE FROM articles")
        conn.executemany(
            "INSERT INTO articles (id, title, keywords, category, related, body, content_hash, updated_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                (
                    a["id"],
                    a["title"],
                    json.dumps(a["keywords"], ensure_ascii=False),
                    a["category"],
                    json.dumps(a["related"], ensure_ascii=False),
                    a["body"],
                    a["content_hash"],
                    now,
                )
                for a in articles
            ],
        )
        conn.commit()
    finally:
        conn.close()

    # Export the compact search index (NO bodies) loaded once by the browser.
    index = [
        {
            "id": a["id"],
            "title": a["title"],
            "keywords": a["keywords"],
            "category": a["category"],
            "related": a["related"],
        }
        for a in articles
    ]
    os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump({"articles": index, "generated_at": now}, f, ensure_ascii=False)

    size_kb = os.path.getsize(INDEX_PATH) / 1024
    print(f"Built {len(articles)} articles.")
    print(f"  SQLite: {DB_PATH}")
    print(f"  Index:  {INDEX_PATH} ({size_kb:.1f} KB)")

    _report_audit(articles)


def _report_audit(articles):
    """Print how many articles are audited-and-current vs need (re)audit."""
    conn = sqlite3.connect(DB_PATH)
    try:
        logged = {
            row[0]: row[1]
            for row in conn.execute("SELECT id, audited_hash FROM audit_log")
        }
    finally:
        conn.close()

    audited, stale, never = [], [], []
    for a in articles:
        if a["id"] not in logged:
            never.append(a["id"])
        elif logged[a["id"]] == a["content_hash"]:
            audited.append(a["id"])
        else:
            stale.append(a["id"])  # audited before, but edited since

    print(
        f"  Audit:  {len(audited)} current, "
        f"{len(stale)} stale (edited since audit), "
        f"{len(never)} never audited"
    )
    if stale:
        print(f"    stale:        {', '.join(sorted(stale))}")
    if never:
        preview = sorted(never)
        shown = ", ".join(preview[:12]) + (" …" if len(preview) > 12 else "")
        print(f"    need audit:   {shown}")


if __name__ == "__main__":
    build()

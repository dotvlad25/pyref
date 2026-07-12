"""
Audit ledger CLI — track which articles have been correctness-audited, so future
audits only need to cover new or edited articles.

An article counts as audited iff `audit_log` has a row whose `audited_hash`
matches the article's CURRENT file hash (sha256 of the whole .md file). Editing
an article changes its hash, so it automatically reverts to "needs audit".

The ledger lives in a separate table from `articles` because build_index.py
wipes/rebuilds `articles` every run; `audit_log` persists across builds.

Usage:
  python server/audit.py pending          # list ids needing (re)audit, one per line
  python server/audit.py pending --json    # same, as a JSON array (for tooling)
  python server/audit.py status            # summary: current / stale / never
  python server/audit.py mark <id> [<id> ...] [--note "..."]   # mark audited at current hash
  python server/audit.py mark-all [--note "..."]               # mark every current article audited
  python server/audit.py reset <id> [<id> ...]                 # remove from ledger (force re-audit)
"""

import argparse
import hashlib
import json
import os
import sqlite3
import sys
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTICLES_DIR = os.path.join(ROOT, "content", "articles")
DB_PATH = os.path.join(ROOT, "server", "reference.db")


def _now():
    return datetime.now(timezone.utc).isoformat()


def current_hashes():
    """Map article id -> current sha256 of its file, straight from disk."""
    out = {}
    for f in sorted(os.listdir(ARTICLES_DIR)):
        if not f.endswith(".md"):
            continue
        path = os.path.join(ARTICLES_DIR, f)
        with open(path, "r", encoding="utf-8") as fh:
            raw = fh.read()
        out[os.path.splitext(f)[0]] = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    return out


def _ensure_table(conn):
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_log (
            id            TEXT PRIMARY KEY,
            audited_hash  TEXT NOT NULL,
            audited_at    TEXT NOT NULL,
            note          TEXT
        )
        """
    )
    conn.commit()


def _logged(conn):
    return {row[0]: row[1] for row in conn.execute("SELECT id, audited_hash FROM audit_log")}


def classify():
    """Return (audited, stale, never) lists of ids vs the current files."""
    cur = current_hashes()
    conn = sqlite3.connect(DB_PATH)
    try:
        _ensure_table(conn)
        logged = _logged(conn)
    finally:
        conn.close()
    audited, stale, never = [], [], []
    for aid, h in cur.items():
        if aid not in logged:
            never.append(aid)
        elif logged[aid] == h:
            audited.append(aid)
        else:
            stale.append(aid)
    return sorted(audited), sorted(stale), sorted(never)


def cmd_pending(args):
    _, stale, never = classify()
    pending = sorted(stale + never)
    if args.json:
        print(json.dumps(pending))
    else:
        for aid in pending:
            print(aid)


def cmd_status(args):
    audited, stale, never = classify()
    total = len(audited) + len(stale) + len(never)
    print(f"{total} articles: {len(audited)} audited-current, "
          f"{len(stale)} stale, {len(never)} never audited")
    if stale:
        print(f"  stale (edited since audit): {', '.join(stale)}")
    if never:
        print(f"  never audited: {', '.join(never)}")


def cmd_mark(args):
    cur = current_hashes()
    ids = args.ids
    missing = [i for i in ids if i not in cur]
    if missing:
        print(f"Unknown article id(s): {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)
    _write_marks(ids, cur, args.note)
    print(f"Marked {len(ids)} article(s) audited at current hash.")


def cmd_mark_all(args):
    cur = current_hashes()
    _write_marks(list(cur), cur, args.note)
    print(f"Marked all {len(cur)} current article(s) audited.")


def _write_marks(ids, cur, note):
    now = _now()
    conn = sqlite3.connect(DB_PATH)
    try:
        _ensure_table(conn)
        conn.executemany(
            "INSERT INTO audit_log (id, audited_hash, audited_at, note) VALUES (?, ?, ?, ?) "
            "ON CONFLICT(id) DO UPDATE SET audited_hash=excluded.audited_hash, "
            "audited_at=excluded.audited_at, note=excluded.note",
            [(i, cur[i], now, note) for i in ids],
        )
        conn.commit()
    finally:
        conn.close()


def cmd_reset(args):
    conn = sqlite3.connect(DB_PATH)
    try:
        _ensure_table(conn)
        conn.executemany("DELETE FROM audit_log WHERE id = ?", [(i,) for i in args.ids])
        conn.commit()
    finally:
        conn.close()
    print(f"Reset {len(args.ids)} article(s); they will show as needing audit.")


def main():
    p = argparse.ArgumentParser(description="Audit ledger for reference articles.")
    sub = p.add_subparsers(dest="cmd", required=True)

    sp = sub.add_parser("pending", help="list ids needing (re)audit")
    sp.add_argument("--json", action="store_true")
    sp.set_defaults(func=cmd_pending)

    sp = sub.add_parser("status", help="summary of audit coverage")
    sp.set_defaults(func=cmd_status)

    sp = sub.add_parser("mark", help="mark ids audited at their current hash")
    sp.add_argument("ids", nargs="+")
    sp.add_argument("--note", default=None)
    sp.set_defaults(func=cmd_mark)

    sp = sub.add_parser("mark-all", help="mark all current articles audited")
    sp.add_argument("--note", default=None)
    sp.set_defaults(func=cmd_mark_all)

    sp = sub.add_parser("reset", help="remove ids from the ledger")
    sp.add_argument("ids", nargs="+")
    sp.set_defaults(func=cmd_reset)

    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()

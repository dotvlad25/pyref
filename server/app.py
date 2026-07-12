"""
Python Reference — local FastAPI server.

Serves:
  GET /                     -> the search UI (web/index.html)
  GET /api/index            -> static search index (title/keywords/category/related)
  GET /api/article/{id}     -> full article body + metadata from SQLite

Run:  uvicorn server.app:app --reload   (from project root)
  or: python server/app.py
"""

import json
import os
import sqlite3
import subprocess
import sys
import tempfile

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "server", "reference.db")
WEB_DIR = os.path.join(ROOT, "web")
STATIC_DIR = os.path.join(ROOT, "static")

app = FastAPI(title="Python Reference")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@app.get("/api/index")
def get_index():
    """Serve the prebuilt search index (loaded once by the browser)."""
    index_path = os.path.join(STATIC_DIR, "index.json")
    if not os.path.exists(index_path):
        raise HTTPException(500, "Index not built. Run: python server/build_index.py")
    return FileResponse(index_path, media_type="application/json")


@app.get("/api/article/{article_id}")
def get_article(article_id: str):
    """Serve one article body on demand."""
    conn = get_conn()
    try:
        row = conn.execute(
            "SELECT id, title, keywords, category, related, body, updated_at "
            "FROM articles WHERE id = ?",
            (article_id,),
        ).fetchone()
    finally:
        conn.close()

    if row is None:
        raise HTTPException(404, f"No article: {article_id}")

    return JSONResponse(
        {
            "id": row["id"],
            "title": row["title"],
            "keywords": json.loads(row["keywords"]),
            "category": row["category"],
            "related": json.loads(row["related"]),
            "body": row["body"],
            "updated_at": row["updated_at"],
        }
    )


@app.get("/")
def index_page():
    return FileResponse(os.path.join(WEB_DIR, "index.html"))


# ---------- Playground: run a snippet with real Python ----------

RUN_TIMEOUT = 15          # seconds of wall-clock per run
MAX_OUTPUT = 200_000      # cap combined stdout+stderr to avoid runaway output


class RunRequest(BaseModel):
    code: str


@app.post("/api/run")
def run_code(req: RunRequest):
    """Execute a Python snippet in a subprocess and return its output.

    Local-only tool (127.0.0.1, single user) — this runs arbitrary code the user
    typed, exactly like a REPL. Not for untrusted input or public exposure.
    """
    code = req.code or ""
    if len(code) > 100_000:
        raise HTTPException(413, "Snippet too large")

    with tempfile.TemporaryDirectory() as tmp:
        script = os.path.join(tmp, "snippet.py")
        with open(script, "w", encoding="utf-8") as f:
            f.write(code)

        try:
            proc = subprocess.run(
                [sys.executable, "-I", script],   # -I: isolated (ignore env/user site)
                capture_output=True,
                text=True,
                timeout=RUN_TIMEOUT,
                cwd=tmp,                           # run in a scratch dir
            )
        except subprocess.TimeoutExpired as e:
            partial = (e.stdout or "") + (e.stderr or "")
            return JSONResponse(
                {
                    "timed_out": True,
                    "returncode": None,
                    "stdout": (e.stdout or "")[:MAX_OUTPUT],
                    "stderr": (e.stderr or "")[:MAX_OUTPUT]
                    + f"\n[timed out after {RUN_TIMEOUT}s]",
                }
            )

        return JSONResponse(
            {
                "timed_out": False,
                "returncode": proc.returncode,
                "stdout": proc.stdout[:MAX_OUTPUT],
                "stderr": proc.stderr[:MAX_OUTPUT],
            }
        )


# Serve frontend assets (app.js, style.css, vendor/) at the root.
app.mount("/", StaticFiles(directory=WEB_DIR), name="web")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)

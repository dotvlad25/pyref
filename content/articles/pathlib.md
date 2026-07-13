---
id: pathlib
title: pathlib
keywords: [pathlib, Path, PurePath, path, joinpath, slash operator, glob, rglob, read_text, write_text, read_bytes, exists, is_file, is_dir, mkdir, suffix, stem, name, parent, parts, resolve, cwd, home, unlink, iterdir, with_suffix]
category: Standard Library
type: reference
related: [os-path, os-walk, file-metadata, file-io, file-hashing]
---
# pathlib

Reach for `Path` for all path building — object-oriented, chainable, and cross-platform (handles `\` vs `/` for you). Preferred over `os.path` string juggling.

```python
from pathlib import Path

p = Path("/var") / "log" / "app.log"   # `/` joins — no os.path.join needed
Path("data").joinpath("raw", "x.csv")  # Path("data/raw/x.csv") — multi-arg join

# Path components
p.name      # "app.log"      p.stem    # "app"
p.suffix    # ".log"         p.parent  # Path("/var/log")
p.parts     # ("/", "var", "log", "app.log")
p.with_suffix(".txt")        # Path("/var/log/app.txt")
```

```python
# Read/write in one call (opens+closes for you)
text  = Path("config.txt").read_text(encoding="utf-8")
data  = Path("img.png").read_bytes()
Path("out.txt").write_text("hi\n", encoding="utf-8")   # truncates
```

```python
# Queries & filesystem ops
p.exists(); p.is_file(); p.is_dir()
Path("logs").mkdir(parents=True, exist_ok=True)  # like mkdir -p, no error if exists
p.resolve()        # absolute, symlinks resolved
Path.cwd(); Path.home()
p.unlink(missing_ok=True)   # delete file
```

```python
# Globbing — glob() is one level, rglob() recurses
list(Path("src").glob("*.py"))       # top level only
list(Path("src").rglob("*.py"))      # recursive (rglob == recursive; no '**/' prefix needed)
for child in Path(".").iterdir():    # immediate children (files + dirs)
    ...
```

Gotchas:
- `glob`/`rglob`/`iterdir` return **generators** — wrap in `list()` to reuse.
- Return `Path` objects to callers; convert with `str(p)` only at API boundaries.
- For a full recursive walk with dir/file separation use [os.walk / scandir](#os-walk).

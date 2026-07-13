---
id: os-path
title: os.path (Path String Operations)
keywords: [os.path, join, basename, dirname, splitext, split, abspath, normpath, expanduser, relpath, commonpath, path manipulation, file extension, split path]
category: Standard Library
type: reference
related: [os-module, pathlib, os-walk, file-metadata, file-io]
---
# os.path (Path String Operations)

Manipulate filesystem paths as strings, portably (handles the OS separator for you). `pathlib` is the modern object-oriented alternative, but `os.path` is everywhere in existing code.

## Build and split

```python
import os

os.path.join("dir", "sub", "file.txt")   # "dir/sub/file.txt" (OS-correct separator)
os.path.join("dir", "/abs")              # "/abs" — an absolute part discards earlier ones

p = "/home/vlad/report.pdf"
os.path.basename(p)     # "report.pdf"   — final component
os.path.dirname(p)      # "/home/vlad"   — everything before it
os.path.split(p)        # ("/home/vlad", "report.pdf")  — both at once
os.path.splitext(p)     # ("/home/vlad/report", ".pdf") — name / extension
```

`splitext` is the clean way to get an extension: `os.path.splitext(p)[1]` → `".pdf"`. A leading dot in the basename is treated as part of the name, not an extension: `os.path.splitext("/x/.bashrc")` → `("/x/.bashrc", "")`.

## Normalize and resolve

```python
os.path.abspath("x/y")          # -> absolute path from the cwd
os.path.normpath("a/./b/../c")  # -> "a/c"  (collapse . and ..)
os.path.expanduser("~/notes")   # -> "/home/vlad/notes"
os.path.relpath("/a/b/c", "/a") # -> "b/c"  (path relative to a base)
```

## Common recipes

```python
# Change a file's extension
root, _ = os.path.splitext(path)
new = root + ".png"

# Walk-and-join (the os.walk idiom)
for dirpath, _, names in os.walk(root):
    for name in names:
        full = os.path.join(dirpath, name)   # reconstruct the full path
```

`os.path.commonpath([...])` finds the shared parent directory of several paths.

## os.path vs pathlib

```python
# os.path (string-based)
os.path.join(os.path.dirname(p), "out.txt")

# pathlib (object-based) — often cleaner
from pathlib import Path
Path(p).with_name("out.txt")
```

Reach for [pathlib](#pathlib) in new code; know `os.path` because it's pervasive and pairs with [os.walk](#os-walk) and [file metadata](#file-metadata).

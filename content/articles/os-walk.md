---
id: os-walk
title: Directory Traversal
keywords: [os.walk, os.scandir, os.listdir, directory, traverse, recursive, dirpath, dirnames, filenames, walk tree, DirEntry, is_file, is_dir, prune directories, os.path.join, find files, topdown]
category: Standard Library
related: [os-path, file-metadata, pathlib, file-io, file-hashing]
---
# Directory Traversal

Reach for `os.walk` to recurse a whole tree with directories and files separated. It yields a 3-tuple `(dirpath, dirnames, filenames)` per directory visited.

```python
import os

def find_files(root_dir: str, extension: str = ".txt") -> list[str]:
    matches = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith(extension):
                matches.append(os.path.join(dirpath, filename))  # build full path
    return matches
```

Prune subtrees by mutating `dirnames` **in place** (only works when `topdown=True`, the default):

```python
for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = [d for d in dirnames if d != ".git"]  # skip .git; slice-assign!
```

`os.scandir` — one directory level, fastest listing (caches `stat` info in `DirEntry`):

```python
with os.scandir(root) as it:          # context manager frees the OS handle
    for entry in it:
        if entry.is_file():           # no extra stat() syscall — cached
            print(entry.name, entry.path)
```

`os.listdir` — just names in one directory (no type info, no recursion):

```python
names = os.listdir(root)   # list[str] of names only; prepend root for full paths
```

Gotchas:
- Prune with `dirnames[:] = ...` (in-place); reassigning `dirnames = ...` does nothing.
- `filenames`/`dirnames` are bare names — join with `os.path.join(dirpath, name)`.
- `os.walk` yields for every dir even if empty; use `topdown=False` for bottom-up (e.g. deleting trees).
- Prefer [pathlib](#pathlib) `rglob` for simple recursive glob matching.

---
id: file-metadata
title: File Metadata (os.stat, os.path)
keywords: [os.stat, stat, st_size, st_ino, inode, st_mtime, st_mode, file size, modification time, islink, isfile, isdir, exists, getsize, getmtime, hardlink, symlink, file metadata]
category: Standard Library
type: reference
related: [os-path, os-walk, file-hashing, duplicate-finder, pathlib]
---
# File Metadata (os.stat, os.path)

Inspect a file without reading its contents. `os.stat(path)` returns a `stat_result` with size, timestamps, and the inode; `os.path.*` gives quick type checks.

```python
import os

st = os.stat(path)
st.st_size            # bytes — no file read needed
st.st_mtime           # last-modified time (float, epoch seconds)
st.st_ino             # inode number (identifies the physical file)
st.st_mode            # type + permission bits
```

## Quick checks and shortcuts

```python
os.path.exists(path)
os.path.isfile(path)      # follows symlinks
os.path.isdir(path)
os.path.islink(path)      # True for the symlink itself
os.path.getsize(path)     # == os.stat(path).st_size
os.path.getmtime(path)    # == os.stat(path).st_mtime
```

`getsize`/`getmtime` are one-call conveniences; use `os.stat` once if you need several fields (one syscall instead of many).

## Size before content

Reading metadata is far cheaper than reading bytes — the size tier of a [duplicate finder](#duplicate-finder) uses only `getsize`, reading zero file content to eliminate most candidates.

```python
if os.path.getsize(a) != os.path.getsize(b):
    ...                    # different size -> can't be identical, skip
```

## Hardlinks and symlinks

Two paths with the **same `st_ino`** (on the same device) are the *same physical file* — a hardlink, not a real duplicate:

```python
a, b = os.stat(pa), os.stat(pb)
same_file = (a.st_ino, a.st_dev) == (b.st_ino, b.st_dev)
```

Symlinks: `os.path.isfile` **follows** them (a link to a file returns True). Use `os.path.islink` to detect the link itself, and `os.stat(path, follow_symlinks=False)` (or `os.lstat`) to stat the link rather than its target.

## Note

`pathlib` wraps all of this — `Path(p).stat()`, `.is_file()`, `.is_symlink()`, `.stat().st_size`. See [pathlib](#pathlib) for the object-oriented style and [os.path](#os-path) for path-string helpers.

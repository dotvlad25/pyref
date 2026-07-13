---
id: file-seek
title: File Seeking (seek & tell)
keywords: [seek, tell, f.seek, random access, file offset, seek from end, whence, SEEK_SET, SEEK_CUR, SEEK_END, os.SEEK_END, read at offset, binary file position, rewind]
category: Standard Library
type: reference
related: [file-io, file-chunking, file-metadata, duplicate-finder]
---
# File Seeking (seek & tell)

Move the file position to read/write at an arbitrary offset instead of streaming top-to-bottom. Essential for large binary files where you want a few bytes from specific spots.

```python
with open(path, "rb") as f:
    f.seek(100)          # jump to byte 100 (from the start)
    chunk = f.read(16)   # read 16 bytes there
    pos = f.tell()       # current offset -> 116
```

## The `whence` argument

`seek(offset, whence)` — where `offset` is measured from:

```python
f.seek(0)                    # start (whence=0, the default)
f.seek(0, 0)                 # SEEK_SET — from beginning
f.seek(10, 1)                # SEEK_CUR — 10 bytes forward from current
f.seek(-16, 2)               # SEEK_END — 16 bytes before the end
```

Use the named constants for clarity:

```python
import os
f.seek(-16, os.SEEK_END)     # last 16 bytes
f.seek(0, os.SEEK_END); size = f.tell()   # size via seek-to-end
```

## Text mode caveat

In **text mode** (`"r"`), only `seek(0)` and seeking to a value previously returned by `tell()` are reliable — encodings make byte↔character offsets nonlinear. For arbitrary offsets, open in **binary** (`"rb"`).

## Sampling a large file cheaply

Reading the first, middle, and last chunk fingerprints a huge file without reading all of it — the [partial-hash](#duplicate-finder) trick:

```python
def sample(path, size, chunk=4096):
    with open(path, "rb") as f:
        if size <= chunk * 3:
            return f.read()                      # small file: read it all
        head = f.read(chunk)
        f.seek(size // 2); mid = f.read(chunk)   # middle
        f.seek(-chunk, os.SEEK_END); tail = f.read(chunk)
    return head + mid + tail
```

For sequential streaming instead of random access, see [file chunking](#file-chunking); for reading whole files, [file I/O](#file-io).

---
id: atomic-writes
title: Atomic File Writes (temp + os.replace)
keywords: [atomic write, os.replace, atomic file, crash safe, temp file rename, no partial write, corrupt file, durable, tempfile, idempotent write, safe save, rename atomic]
category: Standard Library
type: pattern
related: [file-io, pathlib, os-walk, image-pipeline-idempotency, file-hashing]
---
# Atomic File Writes (temp + os.replace)

Writing directly to a destination file is **not crash-safe**: if the process dies mid-write, you're left with a half-written, corrupt file. The fix is a two-step pattern — **write to a temp file, then `os.replace()` it into place**. `os.replace` is atomic *within the same filesystem*: the destination always holds either the complete old file or the complete new one, never a partial one.

```python
import os
from pathlib import Path

def atomic_write_text(path: Path, data: str, encoding="utf-8"):
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(data, encoding=encoding)
    os.replace(tmp, path)          # atomic swap into place
```

Binary is identical — write bytes to the temp file, then replace:

```python
def atomic_write_bytes(path: Path, data: bytes):
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_bytes(data)
    os.replace(tmp, path)
```

## Why `os.replace`, not `os.rename`

`os.replace` overwrites an existing destination on **all** platforms. `os.rename` fails if the target exists on Windows — so `os.replace` is the portable choice for "swap into place."

## Key rules

- **Same filesystem.** Atomicity only holds when the temp file and destination are on the same filesystem (a `rename` across filesystems copies, which isn't atomic). Put the temp file in the **same directory** as the destination — not `/tmp`, which may be a different mount.
- **Unique temp name.** A fixed `.tmp` suffix collides if two processes write the same path at once (they clobber each other's temp). Use `tempfile.mkstemp(dir=path.parent)` or add a `os.getpid()`/`uuid4` suffix to isolate writers.
- **Full durability needs an fsync.** For strict crash durability, `flush()` + `os.fsync()` the temp file before `os.replace`, and fsync the directory after. For most app writes the plain pattern is enough.

## Gotcha: format inference on the temp name

Tools that infer output format from the file **extension** (e.g. Pillow) see `foo.png.tmp` and can't detect the format. Pass it explicitly:

```python
img.save(tmp, format="PNG")     # tmp is "foo.png.tmp" — extension won't help
os.replace(tmp, out_path)
```

This pattern is the backbone of **idempotent, re-runnable jobs** — see the [idempotent image pipeline](#image-pipeline-idempotency).

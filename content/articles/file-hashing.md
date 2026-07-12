---
id: file-hashing
title: File Hashing
keywords: [hashlib, sha256, md5, sha1, hexdigest, digest, checksum, hash file, chunked hash, update, file integrity, deduplication, dedupe, blake2b, file_digest]
category: Standard Library
related: [duplicate-finder, file-chunking, file-io, os-walk]
---
# File Hashing

Reach for chunked hashing to fingerprint files (dedupe, integrity checks) without loading the whole file into memory. Feed blocks into the hash object with `.update()`.

```python
import hashlib

# Time: O(N) in file size   Space: O(chunk_size)
def hash_file(filepath: str, chunk_size: int = 8192) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:            # binary mode is required
        while chunk := f.read(chunk_size):     # walrus: loop until b"" at EOF
            h.update(chunk)                    # incremental — feed each block
    return h.hexdigest()                       # 64-char hex string
```

```python
# hexdigest() -> str of hex; digest() -> raw bytes
h = hashlib.sha256(b"hello")   # can also hash bytes directly in the constructor
h.hexdigest()   # "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
h.digest()      # b'\x2c\xf2...'  (raw bytes)
```

```python
# Python 3.11+: hashlib.file_digest does the chunked read for you
with open("big.iso", "rb") as f:
    digest = hashlib.file_digest(f, "sha256").hexdigest()
```

Algorithm choice: `sha256` / `blake2b` for integrity & security. `md5`/`sha1` are **fast but broken** — fine only for non-security dedupe keys, never for security.

Gotchas:
- Must open in `"rb"` — hashing needs raw bytes, and text-mode newline translation would corrupt the digest.
- Never do `h.update(f.read())` on a large file — defeats the point; use [chunking](#file-chunking).
- Same content ⇒ same digest, so you can dedupe files found via [directory traversal](#os-walk).

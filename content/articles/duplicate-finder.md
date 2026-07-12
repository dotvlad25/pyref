---
id: duplicate-finder
title: Duplicate File Finder (Tiered Hashing)
keywords: [duplicate files, dedup, find duplicates, group by size, partial hash, full hash, tiered filtering, progressive, md5, sha256, os.walk, defaultdict, io savings]
category: Patterns
type: solution
related: [file-hashing, file-metadata, file-seek, grouping, os-walk, defaultdict]
---
# Duplicate File Finder (Tiered Hashing)

Group files with identical content. The naive approach hashes every byte of every file — for 1000 files at 2 GB each that's 2 TB of I/O. The technique is **tiered filtering: apply a cheap discriminator first, and only run the expensive one on the survivors.**

## Naive: hash everything

```python
import os, hashlib
from collections import defaultdict

def hash_file(path, algo="md5", chunk=8192):
    h = hashlib.new(algo)
    with open(path, "rb") as f:
        while block := f.read(chunk):        # stream in chunks — O(chunk) memory
            h.update(block)
    return h.hexdigest()

def find_duplicates(root):
    by_hash = defaultdict(list)
    for dirpath, _, names in os.walk(root):
        for name in names:
            p = os.path.join(dirpath, name)
            if not os.path.isfile(p):
                continue
            try:
                by_hash[hash_file(p)].append(p)
            except OSError:
                continue                      # skip unreadable files
    return [g for g in by_hash.values() if len(g) >= 2]
```

Correct, but reads every byte. See [file hashing](#file-hashing) and [os.walk](#os-walk).

## Tiered: size → partial hash → full hash

Two files can only be identical if they share a size, then a partial hash, then a full hash. Each tier is cheaper and eliminates most candidates before the next.

```python
def find_duplicates_fast(root):
    # Tier 1: group by size — just a stat() call, reads ZERO file bytes.
    by_size = defaultdict(list)
    for dirpath, _, names in os.walk(root):
        for name in names:
            p = os.path.join(dirpath, name)
            if os.path.isfile(p):
                try:
                    by_size[os.path.getsize(p)].append(p)
                except OSError:
                    pass

    # Tier 2: within same-size groups, group by a partial hash (~12 KB read).
    by_partial = defaultdict(list)
    for size, paths in by_size.items():
        if len(paths) < 2:
            continue                          # unique size -> can't be a dup
        for p in paths:
            try:
                by_partial[(size, partial_hash(p, size))].append(p)
            except OSError:
                pass

    # Tier 3: full hash only for files matching on size AND partial hash.
    by_full = defaultdict(list)
    for key, paths in by_partial.items():
        if len(paths) < 2:
            continue
        for p in paths:
            try:
                by_full[hash_file(p)].append(p)
            except OSError:
                pass
    return [g for g in by_full.values() if len(g) >= 2]

def partial_hash(path, size, chunk=4096):
    """Hash first + middle + last chunk — a cheap fingerprint."""
    h = hashlib.md5()
    with open(path, "rb") as f:
        h.update(f.read(chunk))
        if size > chunk * 3:
            f.seek(size // 2); h.update(f.read(chunk))   # middle
            f.seek(-chunk, 2);  h.update(f.read(chunk))   # last (from end)
    return h.hexdigest()
```

## The I/O savings

For 1000 files averaging 2 GB:
- **Naive:** reads ~2 TB (every byte).
- **Tier 1** (size): reads **0 bytes** — pure `stat()`. Most files have a unique size and drop out here.
- **Tier 2** (partial): say 100 share a size → 100 × 12 KB ≈ 1.2 MB.
- **Tier 3** (full): say 10 survive → 10 × 2 GB = 20 GB.

~2 TB → ~20 GB, a 100× reduction — because each tier only feeds its survivors to the next.

## Edge cases worth noting

- **Hash choice:** MD5 is fine and fast for dedup; use SHA-256 if collision-paranoid, or a final byte-for-byte compare to confirm.
- **Hardlinks:** same `os.stat().st_ino` = the same physical file, not a real duplicate — group by inode first to skip.
- **Symlinks:** `os.path.isfile` follows them; use `os.path.islink` to detect and skip.
- **Files changing mid-scan:** a TOCTOU race between `stat` and read — treat dedup as advisory, or re-hash to confirm a final group.

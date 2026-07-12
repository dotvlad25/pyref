---
id: file-chunking
title: Chunking Large Files
keywords: [chunk, chunking, read blocks, walrus operator, memory efficient, stream file, large file, block size, buffer, read size, iter, partial read, binary read, generator]
category: Standard Library
type: pattern
related: [file-io, file-hashing, pathlib]
---
# Chunking Large Files

Reach for chunked reads when a file is too big to fit in memory, or is binary/has no newlines so you can't iterate by line. Read fixed-size blocks with the walrus operator (`:=`) until `read()` returns empty.

```python
import os
from typing import Union

# Time: O(N)  Space: O(chunk_size)  — constant memory regardless of file size
def process_in_chunks(filepath: Union[str, os.PathLike[str]],
                      chunk_size: int = 8192) -> None:
    with open(filepath, "rb") as f:
        while chunk := f.read(chunk_size):   # b"" at EOF is falsy → loop ends
            process_chunk(chunk)
```

`8192` (8 KB) is a good default — aligns with typical OS page / I/O block sizes. Bigger chunk = fewer syscalls (faster sequential reads); smaller chunk = lower peak memory.

```python
# Same idea as a reusable generator you can iterate/pipe
def read_chunks(f, size: int = 8192):
    while chunk := f.read(size):
        yield chunk

with open("big.bin", "rb") as f:
    for block in read_chunks(f):
        ...
```

```python
# iter() with a sentinel — classic pre-walrus idiom (still handy)
from functools import partial
with open("big.bin", "rb") as f:
    for block in iter(partial(f.read, 8192), b""):  # stop when read == b""
        process_chunk(block)
```

Gotchas:
- Use binary mode (`"rb"`); in text mode `read(n)` counts **characters**, not bytes, and a chunk boundary can split a multi-byte character.
- The sentinel must match the mode: `b""` for binary, `""` for text.
- Same pattern powers [file hashing](#file-hashing); for the whole file at once see [file I/O](#file-io).

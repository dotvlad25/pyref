---
id: file-io
title: Reading & Writing Files
keywords: [open, read, readline, readlines, write, writelines, with, context manager, encoding, utf-8, file modes, r w a rb wb, text mode, binary mode, FileNotFoundError, iterate lines, seek, tell, close]
category: Standard Library
related: [file-chunking, file-seek, atomic-writes, pathlib, context-managers, contextlib, json-module]
---
# Reading & Writing Files

Always use `with open(...)` so the file closes even on exception. Always pass `encoding=` in text mode to avoid platform-dependent decode errors.

```python
# Read entire file — small files only
try:
    with open("config.txt", "r", encoding="utf-8") as f:
        content = f.read()          # one str
except FileNotFoundError:
    print("config.txt not found")

# Iterate line by line — memory efficient (lazy), preferred for large files
with open("large_log.txt", "r", encoding="utf-8") as f:
    for line in f:                  # keeps trailing '\n'
        process(line.strip())

# Write (truncates!) / append
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("Result\n")             # write() does NOT add a newline
    f.writelines(["a\n", "b\n"])    # no newline added between items either
```

Modes: `r` read (default), `w` write+truncate, `a` append, `x` exclusive-create (fails if exists), `+` read/write. Add `b` for **binary** (`rb`, `wb`) → yields `bytes`, no `encoding`.

```python
# readlines() loads ALL lines into a list — avoid on huge files
lines = f.readlines()               # list[str], each keeps '\n'
line  = f.readline()                # single line, '' at EOF
```

```python
# with handles multiple files at once
with open("in.txt") as src, open("out.txt", "w") as dst:
    dst.write(src.read())
```

Gotchas:
- `"w"` **destroys** existing contents immediately on open — use `"a"` or `"x"` to be safe.
- `f.read()` without a size loads the whole file into memory — see [chunking](#file-chunking).
- Iterating the file object is lazy; `readlines()` is not.
- For path building/globbing use [pathlib](#pathlib); for a dynamic set of files use `ExitStack` ([contextlib](#contextlib)).

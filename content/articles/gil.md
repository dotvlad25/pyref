---
id: gil
title: The GIL (Global Interpreter Lock)
keywords: [GIL, global interpreter lock, cpython, thread, parallelism, cpu bound, io bound, multiprocessing, reference counting, PEP 703]
category: Concurrency
type: concept
related: [threading-basics, multiprocessing, thread-pool, asyncio-basics]
---
# The GIL (Global Interpreter Lock)

The GIL is a mutex in CPython that lets **only one thread execute Python bytecode at a time**. It exists because CPython's memory management (reference counting) isn't thread-safe.

## What it means practically

| Workload | Threads help? | Why |
|---|---|---|
| **CPU-bound** (pure Python loops, math) | ❌ No | Threads can't run bytecode in parallel; you may even slow down from context-switch overhead. |
| **I/O-bound** (network, disk, DB) | ✅ Yes | The GIL is *released* while waiting on I/O, so other threads run. |

```python
# CPU-bound: threading gives NO speedup — use multiprocessing instead.
# I/O-bound: threading (or asyncio) is a great fit.
```

## Escaping the GIL

1. **multiprocessing / ProcessPoolExecutor** — separate processes, each with its own interpreter and GIL → true parallelism. See [multiprocessing](#).
2. **C extensions** — NumPy, Pillow, etc. explicitly release the GIL during heavy C computation, so they *do* parallelize.
3. **asyncio** — single-threaded concurrency for I/O; sidesteps the GIL debate entirely. See [asyncio basics](#).

## Note

The GIL protects the *interpreter's* internal state, **not your data** — you still need [locks](#) for shared mutable state. PEP 703 adds an optional free-threaded (no-GIL) build, available since 3.13 (experimental) and officially supported in 3.14; the standard build still enables the GIL by default.

---
id: multiprocessing
title: multiprocessing (True Parallelism)
keywords: [multiprocessing, process, pool, ProcessPoolExecutor, cpu bound, parallelism, GIL, shared memory, IPC, map]
category: Concurrency
type: reference
related: [gil, thread-pool, threading-basics, os-module, bounded-concurrency]
---
# multiprocessing (True Parallelism)

Each process has its own interpreter and its own [GIL](#), so `multiprocessing` gives **true parallelism** for **CPU-bound** work. The cost: data crosses process boundaries via pickling (IPC), which isn't free.

## Pool.map — the workhorse

```python
from multiprocessing import Pool

def square(x):
    return x * x

if __name__ == "__main__":            # REQUIRED guard on Windows/macOS spawn
    with Pool(processes=4) as pool:
        results = pool.map(square, range(10))
```

## ProcessPoolExecutor — same API as threads

```python
from concurrent.futures import ProcessPoolExecutor

with ProcessPoolExecutor() as pool:
    results = list(pool.map(cpu_heavy, chunks))
```

Swapping `ThreadPoolExecutor` → `ProcessPoolExecutor` is often all it takes to parallelize CPU work. See [thread pool](#).

## The `__main__` guard

On macOS/Windows, child processes **re-import your module**. Without `if __name__ == "__main__":`, that recursively spawns processes. Always guard your entry point.

## Sharing state

Processes don't share memory by default. Options:

```python
from multiprocessing import Queue, Value, Array

q = Queue()                    # process-safe queue for passing data
counter = Value("i", 0)        # shared integer
arr = Array("d", [0.0] * 10)   # shared array of doubles
```

## When to use what

- **CPU-bound** (compute) → `multiprocessing` / `ProcessPoolExecutor`.
- **I/O-bound** (network, disk) → [threading](#) or [asyncio](#) — cheaper, no pickling.

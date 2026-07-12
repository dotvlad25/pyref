---
id: process-pool
title: "ProcessPoolExecutor"
keywords: [ProcessPoolExecutor, concurrent.futures, cpu-bound, parallelism, multiprocessing, map, submit, max_workers, gil bypass, pickle, ipc, future, executor]
category: Concurrency
related: [thread-pool, multiprocessing, multiprocessing-shared-state, gil, concurrency-vs-parallelism, choosing-concurrency-model, future-objects, asyncio-to-thread]
---
# ProcessPoolExecutor

`concurrent.futures.ProcessPoolExecutor` mirrors [thread-pool](#thread-pool) but runs work in separate OS processes — each with its own [gil](#gil) — giving true parallelism for **CPU-bound** work. It automatically handles IPC to return results.

```python
import concurrent.futures

def factorize(n):                     # CPU-heavy pure-Python work
    factors, d = [], 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d); n //= d
        d += 1
    if n > 1: factors.append(n)
    return factors

if __name__ == '__main__':            # REQUIRED: guard for 'spawn' (macOS/Windows)
    with concurrent.futures.ProcessPoolExecutor(max_workers=4) as ex:
        # map: ordered results, transparently pickles args & return values
        for facs in ex.map(factorize, [3_249_824_598_234, 2_348_972_394_872]):
            print(facs)
```

`max_workers` defaults to `os.cpu_count()`; set it explicitly in containers.

## submit + Future

```python
        fut = ex.submit(factorize, 9_872_349_872_349)  # returns a Future
        print(fut.result())                            # blocks; re-raises worker exceptions
```

## ProcessPool vs ThreadPool

| | ThreadPoolExecutor | ProcessPoolExecutor |
|---|---|---|
| GIL | shared (no CPU parallelism) | bypassed (true parallel) |
| best for | I/O-bound | CPU-bound |
| data transfer | shared memory (refs) | pickled via IPC (slow) |

Gotchas: the function and all args/returns must be **picklable** (no lambdas/closures). IPC + memory-copy overhead is real — use for a few large tasks, not millions of tiny ones. To share mutable state instead of returning results, see [multiprocessing-shared-state](#multiprocessing-shared-state). See also [choosing-concurrency-model](#choosing-concurrency-model).

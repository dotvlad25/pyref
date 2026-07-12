---
id: thread-pool
title: ThreadPoolExecutor & concurrent.futures
keywords: [threadpoolexecutor, concurrent.futures, executor, submit, map, future, as_completed, ProcessPoolExecutor, pool]
category: Concurrency
related: [threading-basics, queue-module, multiprocessing, asyncio-basics]
---
# ThreadPoolExecutor & concurrent.futures

The high-level way to run many tasks concurrently without managing threads by hand.

```python
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=5) as pool:
    future = pool.submit(fetch, url)     # schedule one task
    result = future.result()             # block until done (re-raises exceptions)
# exiting the `with` waits for all tasks to finish
```

## map — apply a function over an iterable

```python
with ThreadPoolExecutor(max_workers=8) as pool:
    for result in pool.map(fetch, urls):   # results in input order
        print(result)
```

## as_completed — handle results as they finish

```python
from concurrent.futures import ThreadPoolExecutor, as_completed

with ThreadPoolExecutor() as pool:
    futures = {pool.submit(fetch, u): u for u in urls}
    for fut in as_completed(futures):        # yields in completion order
        url = futures[fut]
        try:
            data = fut.result()
        except Exception as e:
            print(f"{url} failed: {e}")
```

## Threads vs processes — same API

```python
from concurrent.futures import ProcessPoolExecutor
# Identical interface, but each worker is a separate process:
# use for CPU-bound work to bypass the GIL.
with ProcessPoolExecutor() as pool:
    results = list(pool.map(cpu_heavy, chunks))
```

Rule of thumb: `ThreadPoolExecutor` for I/O-bound, `ProcessPoolExecutor` for CPU-bound. See [multiprocessing](#) and the [GIL](#).

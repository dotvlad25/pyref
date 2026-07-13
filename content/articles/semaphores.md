---
id: semaphores
title: Semaphores
keywords: [semaphore, threading.Semaphore, BoundedSemaphore, counter, bounded concurrency, rate limit, connection pool, acquire, release, permits, limit concurrent access]
category: Concurrency
type: reference
related: [bounded-concurrency, locks, events, condition-variables, thread-pool, barriers]
---
# Semaphores

Reach for a `Semaphore` to cap how many threads use a resource at once — a connection pool, a download limiter, an API rate limit. It holds a counter: `acquire()` decrements (blocks at 0), `release()` increments.

```python
import threading, time

download_limiter = threading.Semaphore(2)   # at most 2 concurrent

def download_file(name):
    with download_limiter:                  # acquire on enter, release on exit
        print(f"downloading {name}...")
        time.sleep(2)
        print(f"finished {name}")

for i in range(5):                          # 5 threads, but only 2 run the body at a time
    threading.Thread(target=download_file, args=(f"file_{i}",)).start()
```

A `Lock` is essentially a semaphore of count 1; a semaphore permits N holders.

## BoundedSemaphore — prefer this

```python
pool = threading.BoundedSemaphore(3)        # raises ValueError if release() overshoots initial value
```

`BoundedSemaphore` catches the classic bug where an extra `release()` silently inflates capacity above the intended limit. Use it unless you deliberately need the counter to grow.

```python
sem = threading.BoundedSemaphore(3)
if sem.acquire(timeout=1.0):                # non-blocking-ish: False if no permit in time
    try:
        ...
    finally:
        sem.release()                       # manual form needs try/finally
```

Gotcha: every `acquire()` must be matched by exactly one `release()` — the `with` form guarantees this. For a fixed-size worker pool, a [ThreadPoolExecutor](#thread-pool) is often simpler than a raw semaphore.

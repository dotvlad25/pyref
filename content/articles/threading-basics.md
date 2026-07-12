---
id: threading-basics
title: threading Basics
keywords: [threading, thread, start, join, daemon, lock, race condition, GIL, concurrent, target]
category: Concurrency
type: reference
related: [queue-module, thread-pool, gil, asyncio-basics, multiprocessing]
---
# threading Basics

Python threads are real OS threads, but the [GIL](#) means only one runs Python bytecode at a time. Use threads for **I/O-bound** work (network, disk); for CPU-bound work use [multiprocessing](#).

```python
import threading

def fetch(name, url):
    print(f"{name} downloading {url}")

t = threading.Thread(target=fetch, args=("t1", "http://..."))
t.start()      # begins running fetch() in a new thread
t.join()       # block until the thread finishes
```

## Start many, join all

```python
threads = [threading.Thread(target=work, args=(i,)) for i in range(5)]
for t in threads:
    t.start()
for t in threads:
    t.join()       # wait for all to finish
```

## Daemon threads

```python
t = threading.Thread(target=poll, daemon=True)
t.start()          # dies automatically when the main program exits
```

## Locks — protect shared mutable state

The GIL protects the *interpreter*, not *your data*. `counter += 1` from many threads is a race. Guard it:

```python
lock = threading.Lock()
counter = 0

def increment():
    global counter
    with lock:            # only one thread in this block at a time
        counter += 1
```

Prefer the `with lock:` form — it always releases, even on exception. For a lock a thread may re-acquire, use `threading.RLock`. For higher-level parallelism, reach for a [thread pool](#).

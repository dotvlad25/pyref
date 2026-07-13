---
id: future-objects
title: Future Objects (concurrent.futures)
keywords: [future, concurrent.futures, submit, result, exception, done, cancel, executor, ThreadPoolExecutor, async result, proxy, blocking result, timeout]
category: Concurrency
type: reference
related: [thread-pool, as-completed, futures-wait, add-done-callback, run-in-executor, process-pool]
---
# Future Objects (concurrent.futures)

`executor.submit(fn, *args, **kwargs)` schedules `fn` and **immediately returns a `Future`** — a proxy for a result that may not exist yet.

```python
import concurrent.futures, time

def slow(x):
    time.sleep(1)
    if x < 0: raise ValueError("negative")
    return x * 2

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
    fut = ex.submit(slow, 5)      # non-blocking; returns Future right away
    print(fut.done())             # False — likely still running
    print(fut.result())           # BLOCKS until done, returns 10
    print(fut.done())             # True
```

Key methods:

```python
fut.result(timeout=None)   # block until done; return value OR re-raise the task's exception
                           # raises TimeoutError if not done within timeout
fut.exception(timeout=None)# block until done; RETURN exception obj (no raise), or None if ok
fut.done()                 # True if finished, cancelled, or raised (non-blocking)
fut.cancel()               # True only if cancelled BEFORE it started running;
                           # False if already running/finished
```

```python
# result() re-raises; exception() returns the error object instead
fut = ex.submit(slow, -1)
err = fut.exception()             # returns ValueError("negative"), does not raise
if err: print(f"failed: {err}")

# cancel() cannot stop an in-flight task
f = ex.submit(slow, 1)
f.cancel()                        # -> False if a worker already picked it up
```

Store futures in a list to await each (in submission order), or feed them to [as_completed](#as-completed) to handle whichever finishes first, or attach [add_done_callback](#add-done-callback). `asyncio` has its own separate [Future](#asyncio-basics) type. See [thread-pool](#thread-pool).

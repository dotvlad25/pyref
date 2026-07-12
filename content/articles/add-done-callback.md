---
id: add-done-callback
title: add_done_callback
keywords: [add_done_callback, callback, future, completion callback, done callback, concurrent.futures, threadpoolexecutor, future.result, on complete, non-blocking callback, worker thread]
category: Concurrency
type: reference
related: [future-objects, thread-pool, as-completed, asyncio-create-task, producer-consumer]
---
# add_done_callback

Attach a function that fires automatically when a `Future` completes — no blocking on `.result()`. The callback takes the `Future` as its only argument.

```python
import concurrent.futures, time

def background_work(x):
    time.sleep(1)
    if x < 0:
        raise ValueError("negative")
    return x * 2

def completion_handler(future):
    # Retrieve result INSIDE try — result() re-raises the task's exception.
    try:
        print(f"Success: {future.result()}")
    except Exception as exc:
        print(f"Failed: {exc}")

with concurrent.futures.ThreadPoolExecutor() as ex:
    f1 = ex.submit(background_work, 5)
    f1.add_done_callback(completion_handler)   # fires ~1s later
    f2 = ex.submit(background_work, -2)
    f2.add_done_callback(completion_handler)   # gets the exception

print("Main thread free to do other work...")
```

**Crucial gotcha — runs in the worker thread**, not the main thread. Whichever thread finished the future executes the callback.

```python
# BAD: heavy work / blocking I/O in a callback ties up the worker
#      thread, so the pool can't pick up new tasks.
# GOOD: keep callbacks fast — log, update UI, or push to a queue.
def handler(fut):
    results_queue.put(fut.result())   # hand off, return immediately
```

- If the future is *already done* when you attach, the callback runs immediately in the calling thread.
- Callback exceptions are logged and swallowed — they don't propagate.
- `asyncio` Tasks also have `add_done_callback`, but there the callback runs on the event loop, not a worker thread. See [asyncio.create_task](#asyncio-create-task).

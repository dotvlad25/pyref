---
id: run-in-executor
title: Mixing Sync & Async
keywords: [to_thread, run_in_executor, blocking, offload, ThreadPoolExecutor, ProcessPoolExecutor, requests, boto3, sqlalchemy, legacy sync library, executor, cpu-bound]
category: Concurrency
related: [event-loop, asyncio-basics, thread-pool, multiprocessing, coroutines]
---
# Mixing Sync & Async

Blocking sync code (`requests.get`, `time.sleep`, heavy CPU, `boto3`, `sqlalchemy`) inside a coroutine **freezes the whole [event loop](#event-loop)**. When you must call a synchronous library, offload it to a pool and `await` the result.

## `asyncio.to_thread` — the easy path (Python 3.9+)

```python
import asyncio, time

def blocking_io():
    time.sleep(2)                 # blocks a worker THREAD, not the loop
    return "Done"

async def main():
    result = await asyncio.to_thread(blocking_io)   # runs in default thread pool
    # to_thread(fn, *args, **kwargs) — exceptions re-raise at the await
    print(result)

asyncio.run(main())
```

Use `to_thread` for simple I/O-bound blocking calls when you don't need to control the pool.

## `loop.run_in_executor` — custom pool / CPU work

```python
import asyncio, time, concurrent.futures

def blocking_io_task(name):
    time.sleep(2)
    return f"Result {name}"

async def main():
    loop = asyncio.get_running_loop()
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        # run_in_executor(executor, fn, *args) -> awaitable
        t1 = loop.run_in_executor(pool, blocking_io_task, "A")
        t2 = loop.run_in_executor(pool, blocking_io_task, "B")
        results = await asyncio.gather(t1, t2)   # await like normal coroutines

asyncio.run(main())
```

- `run_in_executor` only takes **positional** args — use `functools.partial` for kwargs.
- Pass `None` as the executor to use the loop's default thread pool.

## Which to use

| Need | Use |
|------|-----|
| Simple blocking I/O | `asyncio.to_thread(fn, *a)` |
| Custom thread pool (limit concurrency) | `run_in_executor(ThreadPoolExecutor(...), ...)` |
| CPU-bound sync work (bypass the [GIL](#gil)) | `run_in_executor(ProcessPoolExecutor(...), ...)` |

This is the idiomatic way to fold legacy sync libraries into async apps — migrate gradually without a full rewrite.

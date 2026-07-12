---
id: asyncio-to-thread
title: "asyncio.to_thread"
keywords: [to_thread, asyncio.to_thread, offload, blocking, blocking io, run_in_executor, thread pool, background thread, sync in async, legacy library, requests, boto3, do not block event loop]
category: Concurrency
related: [asyncio-basics, run-in-executor, blocking-the-event-loop, thread-pool, process-pool, asyncio-gather, coroutines]
---
# asyncio.to_thread

Python 3.9+ shortcut to offload a blocking, synchronous call to the default background thread pool and `await` its result — without touching the event loop or an executor.

```python
import asyncio, time

def blocking_io():
    time.sleep(2)              # blocks the OS thread, NOT the event loop
    return "Done"              # exception here re-raised at the await

async def main():
    result = await asyncio.to_thread(blocking_io)   # signature: to_thread(fn, *args, **kwargs)
    print(result)

asyncio.run(main())
```

Run many in parallel with [asyncio-gather](#asyncio-gather):

```python
    results = await asyncio.gather(
        asyncio.to_thread(blocking_io),
        asyncio.to_thread(blocking_io),
    )
```

## to_thread vs run_in_executor

```python
# to_thread: simplest, uses default shared ThreadPoolExecutor. No size control.
await asyncio.to_thread(fn, arg)

# run_in_executor: use when you need a CUSTOM pool...
loop = asyncio.get_running_loop()
await loop.run_in_executor(my_thread_pool, fn, arg)   # limit concurrency
await loop.run_in_executor(my_process_pool, fn, arg)  # CPU-bound work
```

- Use `to_thread` for simple I/O-bound blocking calls (`requests`, `boto3`, sync DB drivers).
- Use [run-in-executor](#run-in-executor) when you need a custom-sized `ThreadPoolExecutor` or a [process-pool](#process-pool) for CPU-bound tasks.
- Threads only help I/O-bound work — the [gil](#gil) still serializes pure-Python CPU code. Never do heavy CPU or `time.sleep` directly in a coroutine; see [blocking-the-event-loop](#blocking-the-event-loop).

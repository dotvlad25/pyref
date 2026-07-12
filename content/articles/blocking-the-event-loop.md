---
id: blocking-the-event-loop
title: Blocking the Event Loop
keywords: [blocking event loop, time.sleep, requests, freeze event loop, async blocking, asyncio.sleep, single thread, aiohttp, httpx, aiofiles, asyncpg, offload blocking, run_in_executor, to_thread, cpu bound async]
category: Concurrency
related: [asyncio-basics, asyncio-create-task, asyncio-to-thread, run-in-executor, event-loop, asyncio-debugging, gil]
---
# Blocking the Event Loop

`asyncio` runs everything in **one thread**. A synchronous blocking call inside a coroutine freezes the whole loop — no other task can run until it returns.

```python
import asyncio, time

async def bad():
    print("bad start")
    time.sleep(2)          # BLOCKS the OS thread AND the loop. No switch here!
    print("bad done")

async def good():
    print("good start")
    await asyncio.sleep(2) # yields control: loop runs other tasks meanwhile
    print("good done")

async def main():
    await asyncio.gather(bad(), good())  # good() is stalled by bad()'s sleep

asyncio.run(main())        # ~4s serialized (2s + 2s), not concurrent
```

Analogy: `time.sleep()` pauses the thread; `await asyncio.sleep()` says "schedule someone else."

**Fix: use async libraries** inside `async def`:

| Blocking (bad)     | Async (good)        |
|--------------------|---------------------|
| `requests`         | `aiohttp` / `httpx` |
| open()/file I/O    | `aiofiles`          |
| `psycopg2`         | `asyncpg`           |
| `time.sleep`       | `asyncio.sleep`     |

**If you must call legacy blocking/CPU code**, offload it so the loop stays free:

```python
import asyncio, requests

def blocking_get(url):
    return requests.get(url).text          # sync, blocking

async def main():
    # 3.9+: runs blocking_get in a background thread pool, await the result
    html = await asyncio.to_thread(blocking_get, "https://example.com")
    # older: await loop.run_in_executor(None, blocking_get, url)
```

See [asyncio.to_thread](#asyncio-to-thread) / [run_in_executor](#run-in-executor). Catch hidden blocking with [Debugging asyncio](#asyncio-debugging). Note: threads help I/O-bound work; CPU-bound work needs a process pool (the [GIL](#gil)).

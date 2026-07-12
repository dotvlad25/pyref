---
id: asyncio-basics
title: asyncio Basics (async/await)
keywords: [asyncio, async, await, coroutine, event loop, asyncio.run, create_task, gather, concurrency, non-blocking]
category: Concurrency
type: reference
related: [asyncio-gather, asyncio-queue, threading-basics, gil]
---
# asyncio Basics (async/await)

`asyncio` gives **single-threaded** concurrency for I/O-bound work via an event loop. Coroutines cooperatively yield control at `await` points.

```python
import asyncio

async def fetch(name):
    print(f"{name} start")
    await asyncio.sleep(1)      # non-blocking wait; loop runs others meanwhile
    print(f"{name} done")
    return name

asyncio.run(fetch("a"))         # creates the loop, runs the coroutine, closes loop
```

- Calling a coroutine returns a **coroutine object** — it does *not* run until awaited or scheduled.
- `asyncio.run(main())` is the standard entry point (call it once).

## Running things concurrently

Sequential `await` is *not* concurrent:

```python
await fetch("a")     # 1s
await fetch("b")     # +1s  -> 2s total (they don't overlap)
```

Use tasks or [`gather`](#) to overlap:

```python
async def main():
    a = asyncio.create_task(fetch("a"))   # scheduled immediately
    b = asyncio.create_task(fetch("b"))
    await a
    await b                                # ~1s total — they run concurrently
```

## Never block the loop

A blocking call (`time.sleep`, heavy CPU, sync I/O) freezes *every* coroutine. Use `await asyncio.sleep(...)`, async libraries, or offload blocking work:

```python
result = await asyncio.to_thread(blocking_fn, arg)   # runs in a thread (Python 3.9+)
```

---
id: asyncio-queue
title: asyncio.Queue
keywords: [asyncio, queue, async queue, producer consumer, await put, await get, task_done, join, backpressure]
category: Concurrency
related: [asyncio-basics, asyncio-gather, queue-module]
---
# asyncio.Queue

The async analogue of [`queue.Queue`](#): a coroutine-safe channel for the producer-consumer pattern *inside* a single event loop. `put`/`get` are awaitables, not blocking calls.

```python
import asyncio

async def producer(q):
    for i in range(5):
        await q.put(i)          # awaits if the queue is full (backpressure)
    await q.put(None)           # sentinel to stop the consumer

async def consumer(q):
    while True:
        item = await q.get()    # awaits if empty
        if item is None:
            break
        print("got", item)
        q.task_done()

async def main():
    q = asyncio.Queue(maxsize=10)
    await asyncio.gather(producer(q), consumer(q))

asyncio.run(main())
```

## join / task_done — wait for all work

```python
async def main():
    q = asyncio.Queue()
    workers = [asyncio.create_task(consumer(q)) for _ in range(3)]

    for item in work:
        await q.put(item)

    await q.join()              # wait until every item is task_done()
    for w in workers:
        w.cancel()             # stop idle consumers
```

## Key differences from queue.Queue

- Use `await q.put()` / `await q.get()` — never the blocking versions inside a coroutine.
- Only safe within **one event loop / thread** — it is *not* thread-safe. For cross-thread, use [`queue.Queue`](#).
- `maxsize` gives you backpressure: producers pause when the queue is full. Pair with [gather](#) to run producers and consumers concurrently.

---
id: async-iterators
title: Async Iterators & Generators
keywords: [async for, async generator, async def yield, __aiter__, __anext__, StopAsyncIteration, async with, __aenter__, __aexit__, aclose, streaming, async comprehension]
category: Concurrency
related: [coroutines, asyncio-basics, asyncio-queue, taskgroup, event-loop]
---
# Async Iterators & Generators

Reach for these to consume data that arrives over time (streams, paginated APIs, websocket messages) without blocking the [event loop](#event-loop) between items.

## Async generators — `async def` with `yield`

```python
import asyncio

async def stream_pages(n):
    for i in range(n):
        await asyncio.sleep(0.5)   # await between yields — loop stays free
        yield f"page {i}"          # async generator: has both await AND yield

async def main():
    async for page in stream_pages(3):   # async for drives __anext__
        print(page)

asyncio.run(main())
```

- An `async def` containing `yield` is an **async generator**; iterate with `async for`.
- `async for` is only valid inside an `async def`.

## Async comprehensions

```python
pages = [p async for p in stream_pages(3)]        # async list comprehension
lengths = {p: len(p) async for p in stream_pages(3)}
```

## The protocol: `__aiter__` / `__anext__`

```python
class Countdown:
    def __init__(self, n): self.n = n
    def __aiter__(self): return self
    async def __anext__(self):
        if self.n <= 0:
            raise StopAsyncIteration     # signals async for to stop
        await asyncio.sleep(0.1)
        self.n -= 1
        return self.n + 1
```

## Async context managers — `async with`

```python
class Resource:
    async def __aenter__(self):          # await setup (e.g. open connection)
        return self
    async def __aexit__(self, *exc):     # await teardown
        pass

async def main():
    async with Resource() as r:          # awaits __aenter__/__aexit__
        ...
```

Gotcha: close generators promptly. `async for` handles cleanup, but manual iteration should call `await gen.aclose()` to run `finally` blocks. See [asyncio.Queue](#asyncio-queue) for a fan-out alternative.

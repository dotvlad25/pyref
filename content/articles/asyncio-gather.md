---
id: asyncio-gather
title: asyncio.gather & Concurrent Tasks
keywords: [asyncio, gather, create_task, concurrent, wait_for, timeout, cancel, TaskGroup, return_exceptions]
category: Concurrency
related: [asyncio-basics, asyncio-queue]
---
# asyncio.gather & Concurrent Tasks

`asyncio.gather` runs awaitables **concurrently** and collects their results in order.

```python
import asyncio

async def main():
    results = await asyncio.gather(
        fetch("a"),
        fetch("b"),
        fetch("c"),
    )
    # results == ["a", "b", "c"] — order matches the arguments, not completion
```

## Handling failures

By default, the first exception propagates to the caller immediately — but the other awaitables are **not cancelled** and keep running in the background (a common gotcha). To collect exceptions instead of raising:

```python
results = await asyncio.gather(*tasks, return_exceptions=True)
# each entry is either a result or an Exception instance
```

If you need failing siblings cancelled, use [`TaskGroup`](#taskgroup) instead.

## Timeouts

```python
try:
    result = await asyncio.wait_for(fetch("slow"), timeout=2.0)
except asyncio.TimeoutError:
    print("gave up after 2s")   # the coroutine is cancelled
```

## Cancellation

```python
task = asyncio.create_task(fetch("x"))
task.cancel()
try:
    await task
except asyncio.CancelledError:
    print("cancelled")
```

## TaskGroup (Python 3.11+) — the modern pattern

```python
async with asyncio.TaskGroup() as tg:
    tg.create_task(fetch("a"))
    tg.create_task(fetch("b"))
# all tasks awaited at block exit; if one fails, the rest are cancelled
```

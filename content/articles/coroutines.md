---
id: coroutines
title: Coroutines Explained
keywords: [coroutine, coroutine object, async def, await, awaitable, create_task, schedule, never awaited, RuntimeWarning, async function, cooperative]
category: Concurrency
type: concept
related: [asyncio-basics, event-loop, asyncio-gather, taskgroup, async-iterators]
---
# Coroutines Explained

An `async def` function is a **coroutine function**. Calling it does **not** run the body — it returns a **coroutine object** that must be scheduled on the [event loop](#event-loop).

```python
import asyncio

async def async_sleep():
    print("start")
    await asyncio.sleep(1)   # yield control; loop runs others; wake me when done
    print("done")

coro = async_sleep()         # NOTHING runs yet — just builds the coroutine object
print(type(coro))            # <class 'coroutine'>
asyncio.run(async_sleep())   # this actually runs it
```

- `await` is only valid inside `async def`. It means "pause here, run other tasks, resume when this awaitable finishes."
- Forgetting to await a coroutine: it never runs. In debug mode you get `RuntimeWarning: coroutine 'x' was never awaited`.

## Scheduling vs. calling

`await`ing coroutines one after another runs them **sequentially**. To overlap, schedule them as **tasks** first.

```python
async def fetch(id):
    await asyncio.sleep(1)
    return f"Data {id}"

# Sequential — ~2s total
r1 = await fetch(1)
r2 = await fetch(2)

# Concurrent — ~1s total: both scheduled before we await
t1 = asyncio.create_task(fetch(1))   # runs in background at next loop turn
t2 = asyncio.create_task(fetch(2))
r1, r2 = await t1, await t2
```

- `create_task(coro)` wraps a coroutine in a **Task** and schedules it immediately.
- A coroutine is one kind of **awaitable**; Tasks and Futures are others.
- Prefer [`gather`](#asyncio-gather) or [TaskGroup](#taskgroup) for running many at once.

## Common gotcha

```python
async def main():
    fetch(1)                 # BUG: coroutine created, never awaited -> no-op + warning
    await fetch(1)           # correct
```

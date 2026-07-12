---
id: asyncio-create-task
title: asyncio.create_task
keywords: [asyncio.create_task, create_task, task, background task, concurrent coroutines, schedule coroutine, await task, ensure_future, run coroutines concurrently, event loop task]
category: Concurrency
related: [asyncio-basics, asyncio-gather, coroutines, event-loop, taskgroup, blocking-the-event-loop, asyncio-cancellation]
---
# asyncio.create_task

Just `await`ing coroutines one after another runs them **sequentially**. Wrap them in Tasks to schedule concurrently on the event loop.

```python
import asyncio, time

async def fetch(id):
    await asyncio.sleep(1)          # simulate I/O
    return f"Data {id}"

async def sequential():
    a = await fetch(1)             # waits 1s...
    b = await fetch(2)             # ...then another 1s => ~2s total
```

```python
async def concurrent():
    start = time.time()
    t1 = asyncio.create_task(fetch(1))   # scheduled NOW, runs in background
    t2 = asyncio.create_task(fetch(2))   # also scheduled NOW
    a = await t1                          # both already running concurrently
    b = await t2                          # => ~1s total
    print(f"{time.time()-start:.2f}s", a, b)

asyncio.run(concurrent())
```

Key points:
- `create_task()` returns a `Task` (a `Future` subclass); it starts running at the next `await` point, not instantly.
- Must be called from inside a running loop (i.e. within a coroutine).
- Awaiting the task returns its value or re-raises its exception.

```python
# GOTCHA: keep a reference to the task. The loop holds only a weak
# reference, so a fire-and-forget task can be garbage-collected mid-run.
tasks = [asyncio.create_task(fetch(i)) for i in range(3)]
results = [await t for t in tasks]

# GOTCHA: forgetting create_task/await => "coroutine was never awaited".
# See #asyncio-debugging.
```

For waiting on many at once use [asyncio.gather](#asyncio-gather) or a [TaskGroup](#taskgroup) (3.11+). Never put blocking calls inside — see [Blocking the Event Loop](#blocking-the-event-loop).

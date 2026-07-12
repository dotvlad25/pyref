---
id: taskgroup
title: TaskGroup & Structured Concurrency
keywords: [TaskGroup, asyncio.TaskGroup, structured concurrency, create_task, ExceptionGroup, except star, nursery, error handling, cancel siblings, 3.11]
category: Concurrency
related: [asyncio-gather, coroutines, asyncio-timeouts, event-loop, asyncio-basics]
---
# TaskGroup & Structured Concurrency

`asyncio.TaskGroup` (Python 3.11+) is the modern, recommended way to run tasks concurrently and **wait for all of them as a unit**. It guarantees no task is left dangling: the `async with` block only exits once every child task finishes.

```python
import asyncio

async def fetch(id):
    await asyncio.sleep(1)
    return f"Data {id}"

async def main():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(fetch(1))    # scheduled immediately
        t2 = tg.create_task(fetch(2))
    # block exits only after ALL tasks complete (~1s, concurrent)
    print(t1.result(), t2.result())      # read results after the block

asyncio.run(main())
```

- Create tasks with `tg.create_task(coro)`; read `.result()` **after** the `with` block.
- This is "structured concurrency": task lifetimes are scoped to the block.

## Error handling — automatic sibling cancellation

If any task raises, the group **cancels all remaining siblings**, waits for them, then raises an `ExceptionGroup`. Handle it with `except*`.

```python
async def boom():
    raise ValueError("bad")

async def main():
    try:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(boom())
            tg.create_task(fetch(2))     # gets cancelled when boom() fails
    except* ValueError as eg:            # note the star: unpacks ExceptionGroup
        print("caught:", eg.exceptions)
```

## TaskGroup vs. gather

| | `TaskGroup` (3.11+) | [`gather`](#asyncio-gather) |
|---|---|---|
| On error | cancels siblings, raises `ExceptionGroup` | first error raised; siblings keep running |
| Cleanup | guaranteed at block exit | manual |
| Collect errors | `except*` | `return_exceptions=True` |

Prefer `TaskGroup` for new code — no orphaned tasks, no swallowed exceptions. Combine with [`asyncio.timeout`](#asyncio-timeouts) to bound the whole group. Use `gather(..., return_exceptions=True)` only when you want all results even if some fail.

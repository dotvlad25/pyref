---
id: asyncio-timeouts
title: Timeouts & Cancellation
keywords: [wait_for, timeout, asyncio.timeout, TimeoutError, CancelledError, cancel, task cancellation, shield, deadline, cleanup]
category: Concurrency
type: reference
related: [coroutines, taskgroup, asyncio-gather, event-loop, asyncio-locks]
---
# Timeouts & Cancellation

Reach for these to bound how long an `await` runs and to stop tasks cleanly. Canceling is a major `asyncio` advantage over OS threads.

## `asyncio.wait_for` — give up after N seconds

```python
import asyncio

async def slow_api_call():
    await asyncio.sleep(5)
    return "Data"

async def main():
    try:
        result = await asyncio.wait_for(slow_api_call(), timeout=2.0)
    except asyncio.TimeoutError:                 # inner coro is cancelled for you
        print("The API call timed out!")

asyncio.run(main())
```

`asyncio.timeout()` (Python 3.11+) is a context-manager alternative — cleaner for a block:

```python
async with asyncio.timeout(2.0):     # raises TimeoutError if block exceeds 2s
    await slow_api_call()
```

## Task cancellation

`task.cancel()` injects `asyncio.CancelledError` at the task's next `await`. Handle it to clean up.

```python
async def worker():
    try:
        while True:
            print("running...")
            await asyncio.sleep(1)
    except asyncio.CancelledError:
        print("cancelled, cleaning up...")
        raise                        # re-raise so cancellation propagates!

async def main():
    task = asyncio.create_task(worker())
    await asyncio.sleep(3)
    task.cancel()
    try:
        await task                   # await the cancelled task to observe it
    except asyncio.CancelledError:
        print("confirmed cancelled")
```

- **Always re-raise** `CancelledError` after cleanup — swallowing it breaks cancellation.
- Never do heavy sync work in the `except` block without yielding.

## Protecting cleanup with `shield`

If cleanup itself does `await`, that inner await also receives `CancelledError`. Wrap it in `shield` so it runs to completion:

```python
except asyncio.CancelledError:
    await asyncio.shield(save_state_to_db())   # immune to the outer cancellation
    raise
```

See [TaskGroup](#taskgroup) for structured cancellation of task groups.

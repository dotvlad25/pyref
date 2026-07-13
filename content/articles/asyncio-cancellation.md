---
id: asyncio-cancellation
title: "Asyncio Task Cancellation and Shield"
keywords: [cancel, task.cancel, cancellation, CancelledError, asyncio.CancelledError, shield, asyncio.shield, cleanup, graceful, propagation, uncancel, protect coroutine]
category: Concurrency
type: concept
related: [asyncio-basics, asyncio-create-task, coroutines, asyncio-timeouts, asyncio-gather, taskgroup, sentinel-shutdown]
---
# Asyncio Task Cancellation and Shield

Call `task.cancel()` to request cancellation. A `CancelledError` is injected at the task's next `await` point (or immediately if already suspended).

```python
import asyncio

async def background_worker():
    try:
        while True:
            print("Worker running...")
            await asyncio.sleep(1)
    except asyncio.CancelledError:
        print("Cancelled! Cleaning up...")
        raise  # re-raise so cancellation propagates correctly

async def main():
    task = asyncio.create_task(background_worker())
    await asyncio.sleep(3)
    task.cancel()                 # request cancellation
    try:
        await task                # await the task to observe the result
    except asyncio.CancelledError:
        print("Worker successfully cancelled.")

asyncio.run(main())
```

Rules: cancellation is cooperative — it only lands at an `await`. Always `raise` (don't swallow) `CancelledError` unless you have a deliberate reason; suppressing it breaks `gather`/`TaskGroup` and timeout semantics. Since Python 3.8 `CancelledError` subclasses `BaseException`, so a bare `except Exception` will *not* catch it — catch it by name.

## asyncio.shield — protect cleanup from re-cancellation

A single delivered cancellation does not re-cancel later awaits, so cleanup usually runs fine. But if the task is cancelled *again* while an `except CancelledError` handler is awaiting (repeated `cancel()`, forced shutdown), that inner await also raises `CancelledError` and interrupts cleanup. Wrap the cleanup coroutine in `asyncio.shield()` so it runs to completion.

```python
    except asyncio.CancelledError:
        # inner await is protected from the outer cancellation
        await asyncio.shield(save_state_to_db())
        raise
```

`shield(coro)` wraps `coro` in a protected Future immune to outer cancellation. Note: cancelling the shielded call from *outside* still cancels the inner coro — shield only blocks propagation of the *outer* task's cancellation. See [asyncio-timeouts](#asyncio-timeouts) (timeouts cancel via this mechanism) and [taskgroup](#taskgroup).

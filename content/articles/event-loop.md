---
id: event-loop
title: The Event Loop
keywords: [event loop, asyncio.run, get_running_loop, get_event_loop, run_until_complete, call_soon, call_later, scheduling, single thread, loop, runner]
category: Concurrency
type: concept
related: [asyncio-basics, coroutines, taskgroup, run-in-executor, gil]
---
# The Event Loop

The event loop is the heart of `asyncio`: a **single-threaded** scheduler that tracks tasks, watches sockets/file descriptors, and resumes paused coroutines when their I/O is ready. Reach for it whenever you run I/O-bound work concurrently.

```python
import asyncio

async def main():
    print("Hello...")
    await asyncio.sleep(1)   # yields control back to the loop
    print("...World!")

# Creates a loop, runs main() to completion, then closes the loop.
asyncio.run(main())          # standard entry point (Python 3.7+)
```

- Call `asyncio.run()` **once**, at the top level — it's the bridge from sync to async.
- Calling it while a loop is already running raises `RuntimeError: asyncio.run() cannot be called from a running event loop` (common in Jupyter). In 3.11+ use `asyncio.Runner`.

## Getting the running loop

Inside a coroutine, grab the active loop to schedule callbacks or offload work:

```python
async def main():
    loop = asyncio.get_running_loop()     # preferred inside async code
    loop.call_soon(print, "runs on next iteration")
    loop.call_later(2, print, "runs in ~2s")
    await asyncio.to_thread(blocking_fn)   # loop stays responsive
```

- `get_running_loop()` — use inside coroutines; errors if no loop is running.
- `get_event_loop()` — legacy; avoid in new code (deprecated behavior when no loop).

## Never block the loop

One thread runs everything, so a blocking call (`time.sleep`, heavy CPU, sync I/O) freezes **every** task.

```python
# BAD: freezes the whole loop
time.sleep(2)
# GOOD:
await asyncio.sleep(2)                  # cooperative yield
await asyncio.to_thread(blocking_io)    # offload blocking work
```

Enable `asyncio.run(main(), debug=True)` to log tasks that hog the loop >100ms. See [run-in-executor](#run-in-executor) for offloading and [coroutines](#coroutines) for scheduling vs calling.

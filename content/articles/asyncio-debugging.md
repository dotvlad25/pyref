---
id: asyncio-debugging
title: Debugging asyncio
keywords: [asyncio debug, debug mode, PYTHONASYNCIODEBUG, debug=True, never awaited, coroutine was never awaited, slow callback, task took too long, blocking detection, asyncio troubleshooting, runtimewarning]
category: Concurrency
type: concept
related: [asyncio-basics, blocking-the-event-loop, asyncio-create-task, event-loop, debugging-concurrent-code, asyncio-cancellation]
---
# Debugging asyncio

Async bugs (hangs, tasks that never run) rarely show a useful traceback. Debug mode surfaces the common ones.

**Enable debug mode** (either way):

```bash
PYTHONASYNCIODEBUG=1 python app.py
```

```python
import asyncio
asyncio.run(main(), debug=True)   # equivalent, per-run
```

What it catches:

```python
# 1) Un-awaited coroutine: you called it but never awaited/create_task'd it.
async def work(): ...
async def main():
    work()          # BUG: does nothing. Warns when the coroutine is GC'd:
    # RuntimeWarning: coroutine 'work' was never awaited
    # (fires without debug too; debug adds the creation-site traceback)
    await work()    # correct

# 2) Slow / blocking callbacks: debug mode logs a warning when a single
#    task hogs the loop for >100 ms — your #1 tool for finding hidden
#    synchronous blocking code (time.sleep, requests, heavy CPU).
#    Look for: "Executing <Task ...> took 2.001 seconds"
```

Practical strategies:
- The "took X seconds" warning points straight at code [blocking the event loop](#blocking-the-event-loop) — offload it.
- The "never awaited" warning means a coroutine was created but never scheduled; add `await` or [asyncio.create_task](#asyncio-create-task).
- Debug mode also enables extra checks (e.g. wrong-thread loop calls) and slower, more thorough logging — use in dev, not hot production paths.
- For hung tasks, `asyncio.all_tasks()` lists what is still pending.

Broader concurrency tips: [debugging concurrent code](#debugging-concurrent-code).

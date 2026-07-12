---
id: as-completed
title: as_completed
keywords: [as_completed, concurrent.futures, futures, yield as finished, out of order, first to finish, completion order, web scraping, map vs as_completed, executor]
category: Concurrency
related: [future-objects, thread-pool, add-done-callback, asyncio-gather, as-completed, process-pool]
---
# as_completed

`concurrent.futures.as_completed(futures)` takes an iterable of [Futures](#future-objects) and **yields each one as it finishes**, regardless of submission order. Perfect when task durations vary (web scraping, network calls) and you want results ASAP.

```python
import concurrent.futures, time, random

def task(i):
    time.sleep(random.uniform(0.1, 2.0))   # variable duration
    return f"Task {i} done"

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    # dict maps Future -> its input, so we can recover context when it yields
    futures = {ex.submit(task, i): i for i in range(5)}

    for fut in concurrent.futures.as_completed(futures):
        task_id = futures[fut]                 # look up which input this was
        try:
            print(fut.result())                # already done -> returns immediately
        except Exception as exc:
            print(f"Task {task_id} raised: {exc}")
```

Order of yielding = order of completion (fastest first), NOT order of `submit()`.

```python
# vs executor.map(): map yields results in INPUT order and blocks on each in turn.
# Use map() when order matters; use as_completed() to react to the first finisher.
# as_completed accepts an optional timeout=; raises TimeoutError if not all
# futures complete within it.
for fut in concurrent.futures.as_completed(futures, timeout=10):
    ...
```

Calling `fut.result()` inside the loop never blocks long — `as_completed` only hands you futures that are already done. Contrast with [map](#thread-pool) (ordered) and asyncio's [gather](#asyncio-gather). See [future-objects](#future-objects) and [add-done-callback](#add-done-callback).

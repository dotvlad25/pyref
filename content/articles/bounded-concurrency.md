---
id: bounded-concurrency
title: Bounded Concurrency (Sizing a Worker Pool)
keywords: [bounded concurrency, max_workers, pool sizing, memory budget, limit workers, cpu_count, resource limit, backpressure, how many threads, stream work, semaphore, connection limit]
category: Concurrency
type: pattern
related: [thread-pool, semaphores, os-module, image-pipeline-memory, gil, multiprocessing]
---
# Bounded Concurrency (Sizing a Worker Pool)

"How many workers?" isn't always `cpu_count()`. Each in-flight task consumes a resource — memory, DB connections, API rate — and the pool size must keep the *total* under budget. The rule: **cap workers by the tightest constraint.**

```python
import os

def safe_worker_count(budget: int, per_task: int, cpu: int | None = None) -> int:
    """Largest worker count that keeps peak resource use under budget."""
    cpu = cpu or os.cpu_count() or 4
    by_budget = max(1, budget // per_task)
    return min(cpu, by_budget)          # whichever limit binds first
```

Peak usage ≈ `workers × per_task`, so solving `workers × per_task ≤ budget` gives `workers = budget // per_task`. Take the **min** with `cpu_count` so you never over- or under-subscribe.

```python
# 4 GB budget, ~200 MB per in-flight image:
safe_worker_count(4 * 1024**3, 200 * 1024**2)   # -> min(cpu_count, 20)
```

## Two ways to bound

**Pool size** — decide up front, then fan out:

```python
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=safe_worker_count(budget, per_task)) as pool:
    ...
```

**[Semaphore](#semaphores)** — throttle a subset of steps to a different limit than the pool (e.g. 32 worker threads, but only 4 concurrent DB writes):

```python
import threading
db_slots = threading.Semaphore(4)
def write(row):
    with db_slots:              # at most 4 here at once
        db.insert(row)
```

## Stream, don't preload

Bounding workers only helps if work is **pulled on demand**. Submitting tasks that each open their own resource keeps peak use at `workers × per_task`, independent of the total count. The anti-pattern is loading everything up front:

```python
items = [load(p) for p in all_paths]    # BAD: holds every item at once
```

Let each task load and release its own item (a `with` block frees it promptly). For a concrete memory-budgeted example, see the [memory-bounded image pipeline](#image-pipeline-memory).

## Common budgets to size against

- **Memory** — `budget // per_item_footprint` (large images, model tensors).
- **Connections** — a DB/HTTP pool has a hard max; workers > pool just queue or error.
- **Rate** — external API quota; pair the pool with a rate limiter, not just a size cap.

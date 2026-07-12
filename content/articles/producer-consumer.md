---
id: producer-consumer
title: Producer-Consumer Pattern
keywords: [producer consumer, queue, workers, sentinel, task_done, join, graceful shutdown, worker pool, bounded queue, poison pill, thread safe queue]
category: Concurrency
type: pattern
related: [queue-module, condition-variables, thread-pool, deadlocks, events, asyncio-queue]
---
# Producer-Consumer Pattern

The most common concurrency architecture: producers generate work, consumers process it, decoupled by a thread-safe [queue.Queue](#queue-module). The queue handles all locking internally — no manual [locks](#locks) or [conditions](#condition-variables). (CPU-bound consumers need [multiprocessing](#multiprocessing) due to the [GIL](#gil).)

```python
import threading, queue

data_queue = queue.Queue(maxsize=5)         # bounded: producers block when full

def producer(pid):
    for i in range(3):
        data_queue.put(f"Packet-{pid}-{i}") # blocks if queue is full

def consumer(cid):
    while True:
        item = data_queue.get()             # blocks if queue is empty
        if item is None:                    # sentinel: shut down
            data_queue.task_done()
            break
        try:
            process(item)
        finally:
            data_queue.task_done()          # ALWAYS in finally, else queue.join() hangs on error
```

## Wiring it up + graceful shutdown

```python
consumers = [threading.Thread(target=consumer, args=(i,)) for i in range(2)]
producers = [threading.Thread(target=producer, args=(i,)) for i in range(3)]
for t in consumers + producers: t.start()

for t in producers: t.join()                # wait for all work to be produced
data_queue.join()                           # wait until every item is task_done()

for _ in consumers:                         # ONE sentinel PER worker — N workers need N sentinels
    data_queue.put(None)
for t in consumers: t.join()
```

## Sentinel notes

- Send **exactly one sentinel per consumer thread** — each worker eats one and exits.
- `None` is fine for simple cases; if `None` could be real data, use a unique `STOP = object()` instead (identity is guaranteed unique).
- Every `get()` must be paired with exactly one `task_done()` (including the sentinel), or `queue.join()` blocks forever.

For fixed pools, a [ThreadPoolExecutor](#thread-pool) hides much of this boilerplate.

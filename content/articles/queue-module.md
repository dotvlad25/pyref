---
id: queue-module
title: queue Module (Thread-Safe Queues)
keywords: [queue, thread safe, Queue, LifoQueue, PriorityQueue, put, get, task_done, join, producer consumer, threading]
category: Concurrency
type: reference
related: [deque, threading-basics, thread-pool, asyncio-queue]
---
# queue Module (Thread-Safe Queues)

`queue.Queue` is the thread-safe channel for the producer-consumer pattern. Unlike [`deque`](#), it has built-in locking, blocking, and task tracking. (For single-threaded use, `deque` is faster.)

```python
import queue

q = queue.Queue(maxsize=5)     # 0 = unbounded

q.put(item)                    # blocks if full
q.put(item, timeout=1)         # raises queue.Full after 1s
item = q.get()                 # blocks if empty
item = q.get(timeout=1)        # raises queue.Empty after 1s
```

## Variants

```python
queue.Queue()          # FIFO
queue.LifoQueue()      # stack (LIFO)
queue.PriorityQueue()  # get() returns the smallest; put (priority, item) tuples
```

## Producer-consumer with task tracking

```python
import queue, threading

q = queue.Queue()

def worker():
    while True:
        item = q.get()
        if item is None:       # sentinel: shut down
            break
        process(item)
        q.task_done()          # signal one unit of work finished

threading.Thread(target=worker, daemon=True).start()

for item in work_items:
    q.put(item)

q.join()                       # block until every put() has a matching task_done()
q.put(None)                    # tell the worker to stop
```

- `task_done()` + `join()` let the producer wait until all queued work is *processed*, not just dequeued.
- Use **sentinel values** (like `None`) to signal shutdown to consumers.

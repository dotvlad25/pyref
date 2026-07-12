---
id: sentinel-shutdown
title: Sentinel Pattern for Graceful Shutdown
keywords: [sentinel value, graceful shutdown, poison pill, none sentinel, object sentinel, stop worker threads, queue shutdown, producer consumer exit, task_done]
category: Concurrency
related: [producer-consumer, queue-module, sentinel-shutdown, daemon-threads, thread-pool, asyncio-queue]
---
# Sentinel Pattern for Graceful Shutdown

Non-daemon worker threads block on `queue.get()` forever. To stop them cleanly, enqueue a **sentinel** ("poison pill") — one per worker. When a worker pulls it, it breaks its loop and exits. This drains all real work first, unlike killing [daemon threads](#daemon-threads), which can corrupt files/connections.

```python
import threading, queue

q = queue.Queue()

def consumer():
    while True:
        item = q.get()
        if item is None:            # the sentinel
            q.task_done()           # MUST ack it too (see below)
            break
        try:
            process(item)
        finally:
            q.task_done()           # always ack, even on exception

workers = [threading.Thread(target=consumer) for _ in range(3)]
for w in workers: w.start()

for i in range(10): q.put(i)
q.join()                            # wait for the 10 real items

for _ in range(3): q.put(None)      # one sentinel PER worker
for w in workers: w.join()          # now they actually terminate
```

Gotcha: every `get()` needs a matching `task_done()`, sentinels included — `put(None)` bumps the unfinished-task counter, so skipping `task_done()` deadlocks a later `join()`. Send sentinels *after* `q.join()` returns so they aren't counted.

## Why `object()` instead of `None`

`None` fails if `None` is a legitimate data value. A unique sentinel avoids collisions:

```python
_SHUTDOWN = object()                # unique identity, can't clash with data
...
    if item is _SHUTDOWN:          # compare with `is`, not ==
        break
```

Each `object()` is distinct by identity ([is vs ==](#is-vs-equals)), so a fresh per-pool sentinel can never equal a real payload. Use one sentinel object shared across a pool, but enqueue it N times — once per worker. See [graceful-shutdown-sentinel](#sentinel-shutdown) for the asyncio variant.

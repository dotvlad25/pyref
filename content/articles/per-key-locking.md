---
id: per-key-locking
title: Per-Key Locking (Lock Granularity)
keywords: [per key lock, per user lock, lock granularity, global lock, lock striping, double checked locking, lock map, contention, concurrent dict, thread safe cache, shard locks]
category: Concurrency
related: [locks, race-conditions, rate-limiter, dict, defaultdict]
---
# Per-Key Locking (Lock Granularity)

When many threads mutate *independent* entries of a shared dict (per-user counters, a keyed cache), a single [global lock](#locks) is correct but serializes everything — threads touching *different* keys block each other. Per-key locks remove that contention.

## Global lock — correct, simple, contended

```python
import threading
from collections import defaultdict, deque

class GlobalLocked:
    def __init__(self):
        self.data = defaultdict(deque)
        self.lock = threading.Lock()

    def touch(self, key):
        with self.lock:                 # ALL keys serialize through one lock
            ...                          # mutate self.data[key]
```

Fine at moderate load. At high concurrency it's a bottleneck: a request for `alice` waits on one for `bob`.

## Per-key lock — one lock per key

Give each key its own lock so unrelated keys proceed in parallel. The subtlety: **creating** the per-key lock is itself a shared-map mutation, so guard it — with **double-checked locking** to keep the fast path lock-free once the lock exists.

```python
class PerKeyLocked:
    def __init__(self):
        self.data = defaultdict(deque)
        self._map_lock = threading.Lock()       # protects the lock map only
        self._locks = {}                         # key -> Lock

    def _lock_for(self, key):
        lock = self._locks.get(key)              # fast path: no locking
        if lock is None:
            with self._map_lock:                 # slow path: create once
                lock = self._locks.get(key)      # re-check after acquiring
                if lock is None:
                    lock = self._locks[key] = threading.Lock()
        return lock

    def touch(self, key):
        with self._lock_for(key):                # only same-key ops contend
            ...                                   # mutate self.data[key]
```

The inner re-check matters: two threads can both see `None` before either takes `_map_lock`; the second must not overwrite the first's lock.

## Lock striping — bounded lock count

Per-key locks grow with the number of keys. **Striping** uses a fixed pool of locks and hashes the key to one — constant memory, most of the parallelism. The tradeoff: keys that collide on a stripe share a lock.

```python
class StripedLocks:
    def __init__(self, stripes=64):
        self._locks = [threading.Lock() for _ in range(stripes)]

    def lock_for(self, key):
        return self._locks[hash(key) % len(self._locks)]
```

## Choosing granularity

| Strategy | Concurrency | Memory | Complexity |
|---|---|---|---|
| Global lock | none across keys | O(1) | trivial |
| Per-key lock | full across keys | O(keys) | double-checked create |
| Lock striping | high (collisions share) | O(stripes) | simple |

## Cleanup: don't let the maps grow forever

Per-key data and locks accumulate as keys come and go. Options:

- **Lazy:** when a key's data becomes empty after pruning, delete the entry (and its lock) inline.
- **Background sweep:** a [daemon thread](#daemon-threads) periodically removes idle keys under the map lock.
- **LRU cap:** hold entries in an [`OrderedDict`](#ordereddict), evict the oldest past a size limit.

This is the concurrency layer under a thread-safe [rate limiter](#rate-limiter) or keyed cache — see [race conditions](#race-conditions) for why the check-and-mutate must be inside the lock.

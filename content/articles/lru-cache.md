---
id: lru-cache
title: LRU Cache
keywords: [lru, cache, least recently used, ordereddict, doubly linked list, get, put, O(1), eviction]
category: Data Structures
type: algo
related: [ordereddict, functools-cache, doubly-linked-list, ttl-cache, lru-cache-from-scratch, dict]
---
# LRU Cache

A Least-Recently-Used cache with **O(1)** `get` and `put`. `OrderedDict` is the fastest correct implementation.

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = OrderedDict()      # key -> value, ordered by recency

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)     # mark most-recently-used
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)   # evict least-recently-used (leftmost)
```

`move_to_end`, `popitem(last=False)`, and dict access are all **O(1)**.

## Implementing without OrderedDict

Use a hash map + [doubly linked list](#). The list keeps recency order; the map gives O(1) node lookup. Move a node to the head on access; evict from the tail.

## If any cache works (not LRU-specific)

For pure memoization, don't hand-roll — use [`functools.lru_cache`](#):

```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```

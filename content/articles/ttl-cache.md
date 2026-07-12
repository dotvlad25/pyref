---
id: ttl-cache
title: TTL Cache (Expiring Entries)
keywords: [ttl cache, time to live, expiry, expire, cache expiration, lazy expiration, ordereddict, monotonic, per-entry ttl, stale entry, cachetools]
category: Patterns
type: pattern
related: [lru-cache, ordereddict, functools-cache, dict]
---
# TTL Cache (Expiring Entries)

A cache whose entries expire after a duration. Store an **expiry timestamp** alongside each value and check it on access — **lazy expiration** (evict when touched) is simplest and usually enough. Combine with [LRU](#lru-cache) eviction for a bounded, self-expiring cache.

```python
import time
from collections import OrderedDict

class TTLCache:
    def __init__(self, capacity, default_ttl):
        self.capacity = capacity
        self.default_ttl = default_ttl
        self.cache = OrderedDict()          # key -> (value, expiry)

    def get(self, key):
        if key not in self.cache:
            return None
        value, expiry = self.cache[key]
        if time.monotonic() > expiry:       # expired -> treat as absent
            del self.cache[key]
            return None
        self.cache.move_to_end(key)          # LRU recency touch
        return value

    def put(self, key, value, ttl=None):
        ttl = self.default_ttl if ttl is None else ttl
        if key in self.cache:
            self.cache.move_to_end(key)
        elif len(self.cache) >= self.capacity:
            self.cache.popitem(last=False)   # evict LRU when full
        self.cache[key] = (value, time.monotonic() + ttl)
```

## Key points

- **Store `(value, expiry)`**, compute `expiry = now + ttl` at write time — cheaper than tracking per-entry timers.
- **Use `time.monotonic()`**, not `time.time()` — a wall-clock adjustment must not make entries expire early or live forever.
- **Lazy expiration**: expired entries linger until accessed. Fine for most uses; a stale entry costs only memory until touched.
- **Per-entry TTL** falls out naturally via the `ttl=` argument, over a `default_ttl`.

## Proactive cleanup

Lazy expiration leaves dead entries for keys never read again. If that matters, add a background sweep (a [daemon thread](#daemon-threads) scanning periodically) or a timer wheel. In practice, `cachetools.TTLCache` handles this for you.

## vs plain LRU / lru_cache

Plain [`lru-cache`](#lru-cache) evicts only by recency+capacity, never by time. [`functools.lru_cache`](#functools-cache) has no TTL at all. Reach for a TTL cache when entries go *stale* (config, tokens, API responses), not just when the cache is full.

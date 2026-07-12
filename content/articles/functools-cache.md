---
id: functools-cache
title: functools.lru_cache & cache
keywords: [functools, lru_cache, cache, memoize, memoization, cached_property, maxsize, decorator]
category: Standard Library
related: [lru-cache, dict, recursion-memoization]
---
# functools.lru_cache & cache

Zero-effort memoization via a decorator. Ideal for recursive DP and expensive pure functions.

```python
from functools import lru_cache, cache

@lru_cache(maxsize=None)        # unbounded; same as @cache (Python 3.9+)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

@cache                          # shorthand for lru_cache(maxsize=None)
def grid_paths(r, c):
    if r == 0 or c == 0:
        return 1
    return grid_paths(r - 1, c) + grid_paths(r, c - 1)
```

- `maxsize=N` keeps an LRU cache of the last N distinct calls; `None` never evicts.
- Arguments must be **hashable** (no lists/dicts — pass tuples/frozensets).
- Inspect and reset:

```python
fib.cache_info()     # CacheInfo(hits=..., misses=..., maxsize=..., currsize=...)
fib.cache_clear()
```

## cached_property

Compute once, store on the instance:

```python
from functools import cached_property

class Dataset:
    @cached_property
    def stats(self):
        return expensive_scan(self.data)   # runs once, then cached on the instance
```

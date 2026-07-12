---
id: hashable-objects
title: Hashable Objects
keywords: [hashable, unhashable, hash, __hash__, __eq__, dict key, set element, TypeError unhashable type, immutable, mutable, tuple key, frozenset key, id, caching key]
category: Language
type: concept
related: [frozenset, dict, set, functools-cache, lru-cache, is-vs-equals, dataclasses, magic-methods]
---
# Hashable Objects

An object is **hashable** if it has a `__hash__` that stays constant for its lifetime and an `__eq__`. Hashability is required to be a **dict key**, a **set element**, or a `@cache`/`@lru_cache` argument (those store args as dict keys internally).

```python
# Hashable (immutable): int, float, str, bytes, bool, tuple, frozenset, None,
#                       functions, and most custom objects (hashed by id).
# Unhashable (mutable): list, dict, set, bytearray.
hash("abc"); hash((1, 2)); hash(frozenset({1, 2}))   # all fine
hash([1, 2])          # TypeError: unhashable type: 'list'
{[1, 2]: 0}           # TypeError    {  {1,2}: 0 }  also fails
```

A tuple is hashable only if *all* its elements are — a tuple containing a list is not:

```python
hash((1, (2, 3)))     # ok
hash((1, [2, 3]))     # TypeError: contains a list
```

Fix: convert mutable args before caching or keying ([frozenset](#frozenset) for sets, `tuple` for lists):

```python
import functools
@functools.cache
def solve(items):          # must be hashable
    ...
solve(tuple(my_list))                 # list -> tuple
solve(frozenset(my_set))              # set  -> frozenset
```

Custom objects: default hash is by identity (`id`), so two equal-looking instances are distinct keys. If you define `__eq__`, Python sets `__hash__` to `None` (unhashable) unless you also define `__hash__`. The `__hash__`/`__eq__` contract: `a == b` **must** imply `hash(a) == hash(b)`.

```python
class Point:
    def __init__(self, x, y): self.x, self.y = x, y
    def __eq__(self, o): return (self.x, self.y) == (o.x, o.y)
    def __hash__(self): return hash((self.x, self.y))  # base on same fields

{Point(1, 2): "a"}[Point(1, 2)]       # "a" — equal objects collide correctly
```

Gotchas:
- Only hash on **immutable** fields; mutating a key after insertion corrupts the dict/set (the entry becomes unreachable).
- `@dataclass(frozen=True)` auto-generates a consistent `__hash__`; a plain `@dataclass` with `eq=True` is unhashable ([dataclasses](#dataclasses)).
- `hash` equality is not object equality — use it only for bucketing; see [is-vs-equals](#is-vs-equals).

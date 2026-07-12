---
id: frozenset
title: frozenset
keywords: [frozenset, immutable set, hashable set, set as dict key, set as cache key, memoization key, visited state, backtracking state, dp state, unordered, constant]
category: Data Structures
type: reference
related: [set, hashable-objects, functools-cache, lru-cache, backtracking, dp-intro]
---
# frozenset

`frozenset` is an immutable, hashable `set`. Because it's hashable it can be a **dict/set key** or a `@cache` argument — the main use is a memo key when the state is best described as an *unordered set* (visited nodes, remaining items). Order-independent: `{1,3,5}` and `{5,3,1}` hash equal.

```python
fs = frozenset([1, 3, 5])
fs | {7}                    # frozenset({1,3,5,7}) — ops return new frozensets
# fs.add(9)                 # AttributeError: no mutating methods
1 in fs                     # True, O(1) average membership
frozenset([1,2,3]) == frozenset([3,2,1])   # True (unordered)
```

Use it wherever a plain `set` would fail as a key ([hashable-objects](#hashable-objects)):

```python
visited = set()
state = frozenset([1, 3, 5])   # hashable
visited.add(state)             # works;  visited.add({1,3,5}) -> TypeError: unhashable

seen = {frozenset({"a", "b"}): 1}   # dict keyed by an unordered pair
```

Canonical pattern: memoize a DP/[backtracking](#backtracking) recursion whose state is a set of unvisited items. Convert the mutable set to `frozenset` at the boundary.

```python
import functools

@functools.cache                      # keys must be hashable -> frozenset, not set
def count_paths(remaining):           # remaining: frozenset of unvisited nodes
    if not remaining:
        return 1
    return sum(count_paths(remaining - {node}) for node in remaining)

count_paths(frozenset(range(4)))      # 24
```

Gotchas:
- `frozenset` elements must themselves be hashable (no `frozenset` of lists).
- To dedup unordered groups, collect them as `frozenset`s in a set: e.g. `{frozenset(pair) for pair in edges}` treats `(a,b)` and `(b,a)` as one.
- Empty literal: `frozenset()` — there is no `{}` shorthand (that's a dict).

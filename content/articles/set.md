---
id: set
title: set & frozenset
keywords: [set, frozenset, add, discard, remove, union, intersection, difference, membership, dedup, O(1), subset]
category: Data Structures
related: [dict, counter, defaultdict]
---
# set & frozenset

A `set` is an unordered hash collection of unique, hashable elements with **O(1)** average add/remove/membership. The go-to for dedup and `visited` tracking.

```python
s = {1, 2, 3}
s = set([1, 2, 2, 3])        # {1, 2, 3} — dedups
empty = set()                # NOT {} — that's an empty dict!

s.add(4)
s.discard(9)                 # remove if present; no error if missing
s.remove(2)                  # KeyError if missing
x in s                       # O(1) membership
```

## Set algebra

```python
a, b = {1, 2, 3}, {2, 3, 4}
a | b        # union            -> {1, 2, 3, 4}
a & b        # intersection     -> {2, 3}
a - b        # difference       -> {1}
a ^ b        # symmetric diff   -> {1, 4}
a <= b       # subset test
```

In-place variants: `a |= b`, `a &= b`, `a -= b`.

## Comprehension & dedup

```python
uniq = {x % 3 for x in nums}
seen = set()   # must live OUTSIDE the generator, or it resets each iteration
first_dup = next((x for x in nums if x in seen or seen.add(x)), None)
```

## frozenset — hashable, immutable

```python
fs = frozenset([1, 2, 3])
cache = {fs: "value"}        # can be a dict key or an element of another set
```

Use `frozenset` when you need a set *inside* another set or as a dict key.

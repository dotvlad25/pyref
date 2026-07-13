---
id: cmp-to-key
title: "functools.cmp_to_key"
keywords: [cmp_to_key, cmp to key, comparator, compare, custom sort, three way compare, spaceship, largest number, sort key, functools, "-1 0 1", pairwise order]
category: Standard Library
type: reference
related: [sorting-key, sorted-vs-sort, functools-reduce, comparable-objects, lambda]
---
# functools.cmp_to_key

Use when the order between two elements depends on **both together** and can't be expressed as an independent per-element key. `cmp_to_key` adapts a C/Java-style comparator (returns negative / 0 / positive) into a `key=` function.

```python
from functools import cmp_to_key

def compare(a, b):
    if a < b: return -1   # a before b
    if a > b: return 1    # a after b
    return 0              # equal / keep order

nums = [3, 1, 4, 2]
nums.sort(key=cmp_to_key(compare))   # [1, 2, 3, 4]
```

The three-way comparator idiom (Python has no `<=>`): `(a > b) - (a < b)` yields `-1 / 0 / 1` since bools are `0`/`1`.

```python
def compare(a, b):
    return (a > b) - (a < b)   # ascending; flip operands for descending
```

**Classic use — Largest Number.** Arrange numbers so their concatenation is largest. No per-element key works (`"3"` vs `"30"` depends on the pairing), so compare by concatenation both ways:

```python
def largest_number(nums):
    strs = list(map(str, nums))
    # If a+b > b+a, a should come first (descending).
    def cmp(a, b):
        return (a + b < b + a) - (a + b > b + a)  # -> -1 if a first
    strs.sort(key=cmp_to_key(cmp))
    return "0" if strs[0] == "0" else "".join(strs)

largest_number([3, 30, 34, 5, 9])   # "9534330"
```

Prefer a plain `key=` when order *is* per-element (faster, O(N log N) with N key calls). Reach for `cmp_to_key` only for genuinely pairwise rules — it wraps each element and calls the comparator O(N log N) times.

See [sorting-key](#sorting-key) and [sorted-vs-sort](#sorted-vs-sort) for the common `key=` path.

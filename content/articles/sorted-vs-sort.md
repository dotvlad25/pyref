---
id: sorted-vs-sort
title: "sorted() vs .sort() and Timsort Stability"
keywords: [sorted, sort, list.sort, in-place sort, timsort, stable sort, stability, returns none, reverse, sort key, order n log n, new list]
category: Language
related: [sorting-key, cmp-to-key, list-methods, iterables]
---
# sorted() vs .sort() and Timsort Stability

`.sort()` mutates a list in place and returns `None`. `sorted()` returns a **new** list and accepts **any iterable**.

```python
nums = [3, 1, 4, 1, 5, 9]

nums.sort()                 # in-place; returns None
# print(nums)  -> [1, 1, 3, 4, 5, 9]

nums = [3, 1, 4, 1, 5, 9]
out = sorted(nums)          # new list; original unchanged
# out  -> [1,1,3,4,5,9]; nums -> [3,1,4,1,5,9]

# GOTCHA: .sort() returns None, so this is a classic bug:
result = nums.sort()        # result is None!  (use sorted() to capture)
```

`sorted()` works on non-list iterables; `.sort()` only exists on `list`.

```python
sorted("dcab")              # ['a','b','c','d']  (str -> list of chars)
sorted((3, 1, 2))           # [1, 2, 3]          (tuple in, list out)
sorted({3, 1, 2}, reverse=True)   # [3, 2, 1]
```

Both take `key=` and `reverse=` (see [sorting-key](#sorting-key), [cmp-to-key](#cmp-to-key)).

**Complexity:** both O(n log n) time, O(n) auxiliary space — Timsort allocates a merge buffer even in place; `sorted()` also allocates the output list, so `.sort()` has a smaller footprint.

## Timsort stability

Python's sort is **stable**: equal keys keep their original relative order. This lets you sort by multiple criteria in passes, least-significant first.

```python
people = [("Ann", 30), ("Bob", 25), ("Cat", 30)]

# Stable: Ann still precedes Cat since both have age 30
people.sort(key=lambda p: p[1])
# [('Bob',25), ('Ann',30), ('Cat',30)]

# Two-pass sort: sort by name, then by age -> age primary, name secondary
people.sort(key=lambda p: p[0])   # secondary key first
people.sort(key=lambda p: p[1])   # primary key last (stable preserves name order within age)
```

Prefer a tuple key for one-pass multi-key sorts: `key=lambda p: (p[1], p[0])`.

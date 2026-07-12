---
id: coordinate-compression
title: Coordinate Compression
keywords: [coordinate compression, rank, compress values, map to index, sorted set, dense ranks, discretization, bisect rank, fenwick index]
category: Patterns
type: pattern
related: [fenwick-tree, count-smaller-right, sorting-key, bisect, dict]
---
# Coordinate Compression

Map a set of arbitrary (large, sparse, or negative) values to a small **dense range `0..k-1`** while preserving order. Needed when an algorithm indexes by value — e.g. a [Fenwick tree](#fenwick-tree) sized by value range — but the raw values are too big or sparse to use directly.

```python
def compress(values):
    # rank[value] -> its position in sorted order (0-based)
    ordered = sorted(set(values))
    rank = {v: i for i, v in enumerate(ordered)}
    return rank, ordered            # ordered[i] maps back
```

```python
nums = [50, 12, 100, 12, -3]
rank, ordered = compress(nums)
# rank == {-3: 0, 12: 1, 50: 2, 100: 3}
[rank[x] for x in nums]            # [2, 1, 3, 1, 0]
```

Sort the distinct values, then their positions are the compressed coordinates. `set` dedups so equal values share a rank; `sorted` makes rank monotonic in value, so order-based queries (counts, ranges) still work on the compressed indices.

## With bisect (no dict)

When you only need the rank of a value against the sorted array:

```python
import bisect
ordered = sorted(set(values))
r = bisect.bisect_left(ordered, x)     # rank of x in O(log n)
```

## Why it matters for Fenwick / segment trees

A BIT needs an array indexed `1..k`. Raw values like `10**9` or negatives can't index it; compression maps them to `1..k` (add 1 for the 1-indexed BIT):

```python
rank = {v: i + 1 for i, v in enumerate(sorted(set(nums)))}   # 1-indexed
```

This is the standard setup step for [count smaller to the right](#count-smaller-right) and inversion counting. Complexity: **O(n log n)** to build (the sort), **O(1)** lookups after.

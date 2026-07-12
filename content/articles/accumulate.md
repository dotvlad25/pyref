---
id: accumulate
title: accumulate (Prefix Sums)
keywords: [accumulate, itertools, prefix sum, running total, cumulative sum, prefix scan, running max, initial, operator, reduce, range sum query]
category: Standard Library
type: reference
related: [itertools-overview, chain-islice, sliding-window, functools-cache]
---
# accumulate (Prefix Sums)

`itertools.accumulate` builds a **running total** (prefix scan) in one line — the backbone of range-query problems. **O(n)** to build.

```python
import itertools, operator

nums = [1, 2, 3, 4, 5]
prefix = list(itertools.accumulate(nums))
# [1, 3, 6, 10, 15]   — each element is the sum so far
```

## Range sum in O(1) after O(n) preprocessing

```python
def range_sum(prefix, l, r):        # inclusive [l, r]
    return prefix[r] - (prefix[l - 1] if l > 0 else 0)
```

## Custom function (2nd positional arg)

Any binary function works — running max/min, running product, etc.

```python
itertools.accumulate(nums, operator.mul)     # [1,2,6,24,120] running product
itertools.accumulate([3,1,4,1,5], max)       # [3,3,4,4,5]     running max
itertools.accumulate([3,1,4,1,5], min)       # [3,1,1,1,1]     running min
```

## initial= (Python 3.8+)

Seeds the scan; result is **one element longer**. Handy for an explicit `prefix[0] = 0` sentinel so range queries need no edge check.

```python
list(itertools.accumulate([1,2,3], initial=0))   # [0, 1, 3, 6]
# now range_sum = prefix[r+1] - prefix[l]  with no l>0 guard
```

## Gotchas

```python
# Output length == input length (unless initial= adds one).
# Result is a lazy iterator — wrap in list() to index or reuse.
list(itertools.accumulate([]))          # [] — empty in, empty out
```

Pair prefix sums with [two pointers](#two-pointers) or [sliding window](#sliding-window) for subarray-sum problems (LeetCode #238, #560).

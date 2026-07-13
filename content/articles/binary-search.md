---
id: binary-search
title: Binary Search (Template)
keywords: [binary search, template, sorted, lo hi mid, search, O(log n), first true, boundary, invariant]
category: Patterns
type: algo
related: [bisect, sorting-key]
---
# Binary Search (Template)

When `bisect` doesn't fit (searching a condition, not a value), use these templates. They avoid the classic off-by-one and overflow bugs. Both keep the answer inside a **closed** interval `[lo, hi]`.

```python
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2        # no overflow risk in Python
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1                        # not found
```

## Find first index where a predicate is true

The most reusable form — binary search on the *answer*:

```python
def first_true(lo, hi, pred):
    """Smallest x in [lo, hi] with pred(x) True. Assumes F...FT...T."""
    while lo < hi:
        mid = (lo + hi) // 2
        if pred(mid):
            hi = mid            # mid might be the answer — keep it
        else:
            lo = mid + 1        # mid too small — discard it
    return lo
```

Example — minimum capacity to ship in D days, "can we do it with capacity c?" as the predicate:

```python
ans = first_true(max(weights), sum(weights), lambda c: days_needed(c) <= D)
```

## The two rules that prevent bugs

1. Keep a **clear invariant**: the answer is always inside `[lo, hi]`.
2. When `pred(mid)` is true and `mid` could be the answer, set `hi = mid` (not `mid - 1`).

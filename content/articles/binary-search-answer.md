---
id: binary-search-answer
title: Binary Search on the Answer
keywords: [binary search on answer, binary search on solution space, feasibility, predicate, monotonic, minimize maximum, koko bananas, ship packages, split array, capacity, parametric search]
category: Patterns
related: [binary-search, bisect, quickselect, merge-intervals]
---
# Binary Search on the Answer

Reach for this when a problem says **"minimize the maximum"**, **"maximize the minimum"**, or "smallest capacity/speed/time that works" — and brute force over every candidate answer would be too slow. If you can write a **monotonic feasibility predicate** `can(x)` that is `False...False True...True` over the answer range, binary-search the boundary in **O(log(range) · cost(can))**.

The template: search the *value* range, not an array.

```python
def min_feasible(lo, hi, can):
    """Smallest x in [lo, hi] with can(x) True. Predicate must be monotonic."""
    while lo < hi:
        mid = (lo + hi) // 2
        if can(mid):
            hi = mid              # mid works -> maybe smaller does too
        else:
            lo = mid + 1          # mid too small -> go higher
    return lo                     # lo == hi == answer
```

## Example — Koko eating bananas (LeetCode #875)

Find the min eating speed to finish `piles` within `h` hours.

```python
import math

def min_eating_speed(piles, h):
    def can(speed):                          # feasibility predicate
        hours = sum(math.ceil(p / speed) for p in piles)
        return hours <= h                    # monotonic in speed
    return min_feasible(1, max(piles), can)  # search over speeds
```

## How to spot & set it up

```python
# 1. Answer is a NUMBER in a bounded range [lo, hi].
# 2. can(x) True implies can(x+1) True (monotone) -> binary search valid.
# 3. lo/hi are answer bounds, NOT array indices.
#    e.g. ship packages in D days: lo=max(weights), hi=sum(weights)
# 4. For "maximize the minimum", flip: find LARGEST x with can(x) True
#    (use mid=(lo+hi+1)//2 and lo=mid / hi=mid-1 to avoid infinite loop).
```

This is the same boundary-finding logic as the [binary search template](#binary-search); the twist is the search space is the set of possible answers, verified by a predicate. The book grounds this in the "minimum days to make bouquets" problem.

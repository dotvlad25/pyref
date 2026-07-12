---
id: bisect
title: bisect (Binary Search on Sorted Lists)
keywords: [bisect, binary search, sorted list, insort, bisect_left, bisect_right, lower bound, upper bound, insertion point]
category: Standard Library
related: [binary-search, sorting-key, heapq]
---
# bisect (Binary Search on Sorted Lists)

`bisect` finds insertion points in a **sorted** list in **O(log N)**, so you don't hand-roll binary search.

```python
import bisect

a = [1, 3, 3, 5, 7]

bisect.bisect_left(a, 3)    # 1  — leftmost position where 3 could go
bisect.bisect_right(a, 3)   # 3  — rightmost position (after existing 3s)
bisect.bisect(a, 3)         # 3  — alias for bisect_right
```

## Insert while keeping sorted

```python
bisect.insort(a, 4)         # inserts 4 at the correct spot
# NOTE: insort is O(N) — the search is O(log N) but the list shift is O(N)
```

## Common recipes

**Count elements in a range [lo, hi]:**
```python
lo_i = bisect.bisect_left(a, lo)
hi_i = bisect.bisect_right(a, hi)
count = hi_i - lo_i
```

**Find first element ≥ x (lower bound):**
```python
i = bisect.bisect_left(a, x)
first_ge = a[i] if i < len(a) else None
```

**Search with a key (Python 3.10+):**
```python
i = bisect.bisect_left(records, target, key=lambda r: r.timestamp)
```

For grade-boundary style lookups, `bisect` maps a value to a bucket in one call — cleaner than chained `if`.

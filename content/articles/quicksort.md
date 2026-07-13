---
id: quicksort
title: Quicksort
keywords: [quicksort, quick sort, partition, pivot, in place, lomuto, hoare, divide and conquer, average n log n, worst case n squared, randomized pivot]
category: Algorithms
type: algo
related: [mergesort, quickselect, sorting-key, binary-search]
---
# Quicksort

Reach for this when asked to *implement* sort by hand. **Avg O(n log n)**, **worst O(n²)** (already-sorted input with a bad pivot), avg **O(log n)** stack (worst **O(n)** depth), **in place**, **not stable**. In real code just call `sorted()` (Timsort) — see [sorting](#sorting-key).

Pick a pivot, **partition** so smaller elements go left and larger go right, then recurse on each side.

```python
import random

def quicksort(nums, lo=0, hi=None):
    if hi is None:
        hi = len(nums) - 1
    if lo >= hi:
        return
    p = partition(nums, lo, hi)      # p is pivot's final position
    quicksort(nums, lo, p - 1)
    quicksort(nums, p + 1, hi)

def partition(nums, lo, hi):
    # Randomize pivot -> avoids O(n^2) on sorted input
    r = random.randint(lo, hi)
    nums[r], nums[hi] = nums[hi], nums[r]
    pivot = nums[hi]                  # Lomuto: pivot at the end
    i = lo                            # boundary: nums[lo:i] < pivot
    for j in range(lo, hi):
        if nums[j] < pivot:
            nums[i], nums[j] = nums[j], nums[i]
            i += 1
    nums[i], nums[hi] = nums[hi], nums[i]   # drop pivot into place
    return i
```

## Key facts

```python
# - After partition, nums[p] is in its FINAL sorted position.
# - Recurse only on the two sides, never on p itself.
# - Random pivot (or median-of-three) is what makes worst case rare.
# - Not stable: equal elements can be reordered by the swaps.
```

The same partition routine powers [quickselect](#quickselect) (kth element in avg O(n)). When you need a *stable* O(n log n) sort, use [merge sort](#mergesort).

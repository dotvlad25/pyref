---
id: quickselect
title: Quickselect
keywords: [quickselect, quick select, kth largest, kth smallest, selection algorithm, partition, pivot, average O(n), median, top k, nth element]
category: Algorithms
related: [quicksort, top-k, heapq, heap-tuples]
---
# Quickselect

Reach for this to find the **kth smallest/largest** element in **average O(n)** — faster than sorting (O(n log n)) and no heap needed. Worst case O(n²), mitigated by a random pivot. Classic on LeetCode #215.

Same [partition](#quicksort) as quicksort, but recurse into **only one side** — the side containing rank k.

```python
import random

def quickselect(nums, k):
    """Return the k-th SMALLEST element (k is 0-indexed)."""
    lo, hi = 0, len(nums) - 1
    while True:
        if lo == hi:
            return nums[lo]
        p = partition(nums, lo, hi)
        if p == k:
            return nums[p]           # pivot landed on rank k -> done
        elif p < k:
            lo = p + 1               # answer is to the right
        else:
            hi = p - 1               # answer is to the left

def partition(nums, lo, hi):
    r = random.randint(lo, hi)       # random pivot -> avoids O(n^2)
    nums[r], nums[hi] = nums[hi], nums[r]
    pivot = nums[hi]
    i = lo
    for j in range(lo, hi):
        if nums[j] < pivot:
            nums[i], nums[j] = nums[j], nums[i]
            i += 1
    nums[i], nums[hi] = nums[hi], nums[i]
    return i
```

## kth largest = kth smallest from the other end

```python
def kth_largest(nums, k):
    return quickselect(nums, len(nums) - k)   # k-th largest, k>=1
```

## When to prefer alternatives

```python
# Streaming / can't mutate input, or need ALL top-k: use a heap.
import heapq
heapq.nlargest(k, nums)          # O(n log k), see top-k / heapq
```

Iterative loop (above) avoids recursion depth issues. Uses O(1) extra space and mutates the input.

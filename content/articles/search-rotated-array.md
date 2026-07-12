---
id: search-rotated-array
title: Search in Rotated Sorted Array
keywords: [search rotated sorted array, rotated array, leetcode 33, binary search variant, pivot, which half is sorted, find minimum rotated, o(log n)]
category: Algorithms
type: algo
related: [binary-search, binary-search-answer, bisect, two-pointers]
---
# Search in Rotated Sorted Array

A sorted array rotated at an unknown pivot (e.g. `[4,5,6,7,0,1,2]`). Plain [binary search](#binary-search) breaks, but the O(log n) structure survives: **at least one half is always sorted**. Check which half is sorted, test whether `target` lies inside it, then discard the other half.

```python
# LeetCode #33 — O(log n) time, O(1) space
def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:            # left half [lo..mid] is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1                 # target in sorted left
            else:
                lo = mid + 1
        else:                                # right half [mid..hi] is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1                 # target in sorted right
            else:
                hi = mid - 1
    return -1
```

Key: `nums[lo] <= nums[mid]` decides which side is sorted. Use `<=` (not `<`) so a 1-element window `lo == mid` counts as sorted. Bounds checks use the *sorted* end (`nums[lo]`/`nums[hi]`), never `nums[mid]` on the unsorted side.

## Find the minimum / pivot

```python
# LeetCode #153 — index of smallest element (rotation point)
def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:   # min is strictly right of mid
            lo = mid + 1
        else:                      # min is at mid or left
            hi = mid
    return lo                      # nums[lo] is the minimum
```

Gotcha: compare `nums[mid]` to `nums[hi]`, not `nums[lo]` — a non-rotated array (`nums[mid] > nums[lo]` always) would fool the `lo` comparison. Duplicates (LeetCode #81) can degrade both to O(n) worst case.

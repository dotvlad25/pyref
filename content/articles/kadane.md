---
id: kadane
title: Kadane's Max Subarray
keywords: [kadane, maximum subarray, max subarray sum, contiguous, running max, dp, leetcode 53, best subarray, current sum]
category: Algorithms
related: [dp-intro, sliding-window, two-pointers, house-robber]
---
# Kadane's Max Subarray

Reach for Kadane's when you need the **maximum sum of a contiguous subarray** (LeetCode #53). One pass, O(n) time / O(1) space. The DP insight: the best subarray ending at `i` either extends the previous one or restarts at `i`.

```python
def max_subarray(nums):
    cur = best = nums[0]        # must seed with nums[0], not 0
    for x in nums[1:]:
        cur = max(x, cur + x)   # extend previous, or start fresh at x
        best = max(best, cur)
    return best
# O(n) time, O(1) space
# [-2,1,-3,4,-1,2,1,-5,4] -> 6  (subarray [4,-1,2,1])
```

Gotcha: seeding `best = 0` breaks on all-negative input (`[-3,-1,-2]` should return `-1`, not `0`).

Track the actual indices when you must return the subarray itself:
```python
def max_subarray_range(nums):
    cur = best = nums[0]
    start = lo = hi = 0
    for i in range(1, len(nums)):
        if nums[i] > cur + nums[i]:
            cur, start = nums[i], i     # restart window at i
        else:
            cur += nums[i]
        if cur > best:
            best, lo, hi = cur, start, i
    return best, nums[lo:hi + 1]
```

Variant — max product subarray tracks both min and max (negatives flip sign):
```python
def max_product(nums):
    cur_max = cur_min = best = nums[0]
    for x in nums[1:]:
        cands = (x, cur_max * x, cur_min * x)
        cur_max, cur_min = max(cands), min(cands)
        best = max(best, cur_max)
    return best
```

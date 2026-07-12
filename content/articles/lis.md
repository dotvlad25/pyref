---
id: lis
title: Longest Increasing Subsequence
keywords: [lis, longest increasing subsequence, patience sorting, bisect, o(n log n), dp, leetcode 300, subsequence, tails]
category: Algorithms
related: [dp-intro, bisect, binary-search, lcs]
---
# Longest Increasing Subsequence

Length of the longest strictly increasing (non-contiguous) subsequence — LeetCode #300. Two implementations.

**O(n^2) DP** — `dp[i]` = LIS ending at index `i`:
```python
def lis(nums):
    if not nums:
        return 0
    dp = [1] * len(nums)                 # every element is an LIS of length 1
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)
# O(n^2) time, O(n) space
```

**O(n log n)** with [bisect](#bisect) (patience sorting). `tails[k]` = smallest possible tail of an increasing subsequence of length `k+1`:
```python
from bisect import bisect_left

def lis(nums):
    tails = []
    for x in nums:
        i = bisect_left(tails, x)        # leftmost slot >= x
        if i == len(tails):
            tails.append(x)              # x extends the longest run
        else:
            tails[i] = x                 # replace to keep tails minimal
    return len(tails)
# O(n log n) time, O(n) space
# Gotcha: `tails` is NOT a valid LIS itself — only its LENGTH is meaningful.
```

Use `bisect_right` instead of `bisect_left` to allow the **non-decreasing** variant (duplicates permitted):
```python
from bisect import bisect_right
# ... i = bisect_right(tails, x)  -> longest non-decreasing subsequence
```

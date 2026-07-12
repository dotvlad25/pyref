---
id: house-robber
title: House Robber
keywords: [house robber, linear dp, rolling variables, non-adjacent, max sum no two adjacent, leetcode 198, leetcode 213, circular, dp]
category: Algorithms
type: algo
related: [dp-intro, kadane, knapsack]
---
# House Robber

Maximize the sum of chosen elements where **no two adjacent** elements may be picked (LeetCode #198). At each house: skip it (keep `prev` best) or rob it (`prev2 + money`).

**Rolling variables** — O(n) time, O(1) space:
```python
def rob(nums):
    prev, cur = 0, 0        # prev = best up to i-2, cur = best up to i-1
    for x in nums:
        prev, cur = cur, max(cur, prev + x)
    return cur
# rob([2,7,9,3,1]) -> 12  (2 + 9 + 1)
```

Equivalent explicit DP array (clearer first pass):
```python
def rob(nums):
    if not nums:
        return 0
    dp = [0] * (len(nums) + 1)
    dp[1] = nums[0]
    for i in range(2, len(nums) + 1):
        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i - 1])
    return dp[-1]
```

**House Robber II** — houses in a circle, so first and last are adjacent (LeetCode #213). Run the linear solver twice, excluding one end each time:
```python
def rob_circular(nums):
    if len(nums) == 1:
        return nums[0]
    def line(arr):
        prev = cur = 0
        for x in arr:
            prev, cur = cur, max(cur, prev + x)
        return cur
    return max(line(nums[1:]), line(nums[:-1]))  # drop first OR last
```

Gotcha: the two-variable swap `prev, cur = cur, max(cur, prev + x)` must be a single tuple assignment so both use the old values.

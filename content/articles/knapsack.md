---
id: knapsack
title: 0/1 Knapsack
keywords: [knapsack, 0/1 knapsack, subset sum, weight value, capacity, rolling array, 1d dp, 2d dp, partition equal subset sum, dp]
category: Algorithms
related: [dp-intro, coin-change, lcs, recursion-memoization]
---
# 0/1 Knapsack

Reach for this when each item can be taken **at most once** and you maximize value under a weight/capacity budget. State = `(item index, remaining capacity)`.

**2D DP** — clearest to reason about:
```python
def knapsack(weights, values, cap):
    n = len(weights)
    dp = [[0] * (cap + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        w, v = weights[i - 1], values[i - 1]
        for c in range(cap + 1):
            dp[i][c] = dp[i - 1][c]                  # skip item i
            if w <= c:                                # or take it
                dp[i][c] = max(dp[i][c], dp[i - 1][c - w] + v)
    return dp[n][cap]
# O(n * cap) time and space
```

**Rolling 1D** — only the previous row is needed. Iterate capacity **backwards** so each item is used once:
```python
def knapsack(weights, values, cap):
    dp = [0] * (cap + 1)
    for w, v in zip(weights, values):
        for c in range(cap, w - 1, -1):      # REVERSE — the 0/1 trick
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]
# O(n * cap) time, O(cap) space
# Gotcha: forward iteration would reuse an item (that's UNBOUNDED knapsack)
```

Subset-sum / partition (LeetCode #416) is boolean 0/1 knapsack:
```python
def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [True] + [False] * target
    for x in nums:
        for c in range(target, x - 1, -1):   # reverse again
            dp[c] |= dp[c - x]
    return dp[target]
```

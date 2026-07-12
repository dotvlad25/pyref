---
id: coin-change
title: Coin Change
keywords: [coin change, min coins, fewest coins, number of ways, count combinations, unbounded knapsack, dp, leetcode 322, leetcode 518, cache]
category: Algorithms
related: [dp-intro, knapsack, functools-cache, recursion-memoization]
---
# Coin Change

Two classic variants on the same coins. Both are **unbounded** (reuse coins freely).

**Minimum coins** to make `amount` (LeetCode #322). Top-down with `@cache` — the book's go-to:
```python
from functools import cache

def coin_change(coins, amount):
    @cache
    def dp(rem):
        if rem == 0:
            return 0
        if rem < 0:
            return float('inf')          # invalid path
        return min(dp(rem - c) + 1 for c in coins)
    ans = dp(amount)
    return ans if ans != float('inf') else -1
# O(amount * len(coins)) time and space
```

Bottom-up tabulation (no recursion limit):
```python
def coin_change(coins, amount):
    dp = [0] + [float('inf')] * amount   # dp[a] = min coins for a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1
```

**Count ways** to make `amount` (LeetCode #518). Iterate coins in the outer loop so each combination is counted once (order doesn't matter):
```python
def change(amount, coins):
    dp = [1] + [0] * amount              # dp[0] = 1 (empty selection)
    for c in coins:                      # coin loop OUTSIDE
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]
# Gotcha: swapping the loops counts PERMUTATIONS, not combinations.
```

For minimum coins the loop order is interchangeable; for counting combinations it is not. See [knapsack](#knapsack) for the 0/1 (each item once) version.

---
id: dp-intro
title: Dynamic Programming Fundamentals
keywords: [dynamic programming, dp, memoization, tabulation, top-down, bottom-up, overlapping subproblems, optimal substructure, state, recurrence, cache, functools cache]
category: Algorithms
type: concept
related: [recursion-memoization, functools-cache, lru-cache, coin-change, knapsack, kadane]
---
# Dynamic Programming Fundamentals

Reach for DP when a problem has **overlapping subproblems** (same computation repeats) and **optimal substructure** (answer builds from sub-answers). Two implementations: **top-down** with memoization (easy to write) and **bottom-up** tabulation (more space-efficient).

The 3 questions to define any DP:
```python
# 1. STATE      — what args fully describe a subproblem? (the memo key)
# 2. RECURRENCE — how does a state combine smaller states?
# 3. BASE CASE  — smallest states with known answers
```

Top-down: write the recursion, then just add `@cache`. Start here.
```python
from functools import cache

@cache
def fib(n):
    if n < 2:            # base case
        return n
    return fib(n - 1) + fib(n - 2)   # recurrence
# O(n) time / O(n) space — @cache turns O(2^n) into O(n)
```

Bottom-up: same recurrence, filled iteratively into a table.
```python
def fib(n):
    if n < 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]
# Often reducible to O(1) space with rolling vars (see house-robber)
```

Choosing:
```python
# @cache top-down: fastest to write, natural for tricky state.
#   Gotcha: deep recursion can hit Python's recursion limit (~1000).
#   All @cache args must be hashable (use tuples, not lists).
# Tabulation: no recursion limit; enables rolling-array space savings.
```

See [coin-change](#coin-change), [knapsack](#knapsack), [lcs](#lcs), and [grid-dp](#grid-dp) for the classic patterns.

---
id: recursion-memoization
title: Recursion & Memoization (Top-Down DP)
keywords: [recursion, memoization, dynamic programming, dp, top down, cache, lru_cache, fibonacci, overlapping subproblems, recursion limit]
category: Patterns
type: pattern
related: [functools-cache, dfs, binary-search]
---
# Recursion & Memoization (Top-Down DP)

Top-down DP = plain recursion + a cache over overlapping subproblems. Turns exponential recursion into polynomial time.

## The pattern

```python
from functools import cache

@cache
def climb(n):                     # ways to climb n stairs, 1 or 2 at a time
    if n <= 2:
        return n
    return climb(n - 1) + climb(n - 2)
```

`@cache` (or `@lru_cache`) memoizes automatically — see [functools cache](#). Arguments must be **hashable** (use tuples, not lists).

## Manual memo (when args aren't hashable, or for grids)

```python
def solve(i, j, memo=None):
    if memo is None:                  # fresh cache per call — never a mutable default
        memo = {}
    if (i, j) in memo:
        return memo[(i, j)]
    if base_case(i, j):
        return base_value
    memo[(i, j)] = combine(solve(i - 1, j, memo), solve(i, j - 1, memo))
    return memo[(i, j)]
```

## Turning recursion into a DP table (bottom-up)

Once the recurrence is clear, an iterative table avoids recursion overhead and stack limits:

```python
def climb_bottom_up(n):
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b          # rolling window — O(1) space
    return b
```

## Recursion limit

Python caps recursion (default 1000) to protect the C stack. For deep recursion, raise it modestly or go iterative:

```python
import sys
sys.setrecursionlimit(10_000)
```

Setting it too high can crash the interpreter (C stack overflow / segfault) rather than raise `RecursionError` — prefer the bottom-up table for very deep problems.

The three DP steps: **define the state**, **write the recurrence**, **add memoization** (or a table).

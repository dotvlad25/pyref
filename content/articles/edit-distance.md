---
id: edit-distance
title: Edit Distance
keywords: [edit distance, levenshtein, string dp, insert delete replace, min operations, 2d dp, leetcode 72, spell check]
category: Algorithms
related: [dp-intro, lcs, grid-dp]
---
# Edit Distance

Minimum single-character **insert / delete / replace** operations to turn `a` into `b` (Levenshtein distance, LeetCode #72). State = `(i, j)` = edit distance between `a[:i]` and `b[:j]`.

**2D DP table**:
```python
def edit_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i          # delete all i chars of a
    for j in range(n + 1):
        dp[0][j] = j          # insert all j chars of b
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]        # chars match: free
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],      # delete a[i-1]
                    dp[i][j - 1],      # insert b[j-1]
                    dp[i - 1][j - 1],  # replace a[i-1] -> b[j-1]
                )
    return dp[m][n]
# O(m*n) time and space.  edit_distance("horse","ros") -> 3
```

Top-down with `@cache` mirrors the recurrence:
```python
from functools import cache

def edit_distance(a, b):
    @cache
    def dp(i, j):
        if i == 0:
            return j          # insert remaining of b
        if j == 0:
            return i          # delete remaining of a
        if a[i - 1] == b[j - 1]:
            return dp(i - 1, j - 1)
        return 1 + min(dp(i-1, j), dp(i, j-1), dp(i-1, j-1))
    return dp(len(a), len(b))
```

Space-optimize to O(n) by keeping only the previous row (same rolling trick as [grid-dp](#grid-dp)):
```python
def edit_distance(a, b):
    prev = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            cur[j] = (prev[j-1] if a[i-1] == b[j-1]
                      else 1 + min(prev[j], cur[j-1], prev[j-1]))
        prev = cur
    return prev[-1]
```
Closely related to [lcs](#lcs) — same grid, different recurrence.

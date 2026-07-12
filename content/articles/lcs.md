---
id: lcs
title: Longest Common Subsequence
keywords: [lcs, longest common subsequence, 2d dp table, string dp, diff, edit distance cousin, leetcode 1143, subsequence]
category: Algorithms
type: algo
related: [dp-intro, edit-distance, lis, knapsack]
---
# Longest Common Subsequence

Reach for LCS when comparing two sequences for a shared (non-contiguous, in-order) subsequence — LeetCode #1143, the basis of `diff`. State = `(i, j)` = LCS of `a[:i]` and `b[:j]`.

**2D DP table**:
```python
def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]   # row/col 0 = empty
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1      # match: extend diagonal
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])  # skip one char
    return dp[m][n]
# O(m*n) time and space.  lcs("abcde","ace") -> 3
```

Top-down equivalent with `@cache`:
```python
from functools import cache

def lcs(a, b):
    @cache
    def dp(i, j):
        if i == 0 or j == 0:
            return 0
        if a[i - 1] == b[j - 1]:
            return dp(i - 1, j - 1) + 1
        return max(dp(i - 1, j), dp(i, j - 1))
    return dp(len(a), len(b))
```

Reconstruct the actual subsequence by walking the table backwards:
```python
def lcs_string(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = (dp[i-1][j-1] + 1 if a[i-1] == b[j-1]
                        else max(dp[i-1][j], dp[i][j-1]))
    i, j, out = m, n, []
    while i and j:
        if a[i-1] == b[j-1]:
            out.append(a[i-1]); i -= 1; j -= 1
        elif dp[i-1][j] >= dp[i][j-1]:
            i -= 1
        else:
            j -= 1
    return ''.join(reversed(out))
```

Related: [edit-distance](#edit-distance) uses the same grid shape; longest common *substring* (contiguous) resets to 0 on mismatch instead.

---
id: grid-dp
title: Grid Path DP
keywords: [grid dp, unique paths, min path sum, matrix dp, robot paths, 2d dp, rolling row, leetcode 62, leetcode 64, dungeon]
category: Algorithms
type: algo
related: [dp-intro, edit-distance, coin-change]
---
# Grid Path DP

Reach for grid DP when moving through a matrix (usually right/down only) and counting paths or optimizing a cost. State = `(r, c)` built from the cells above and to the left.

**Unique paths** — count routes from top-left to bottom-right (LeetCode #62):
```python
def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]      # first row/col all reachable 1 way
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]   # from top + from left
    return dp[m - 1][n - 1]
# O(m*n) time and space
```

Rolling 1D row — O(n) space:
```python
def unique_paths(m, n):
    row = [1] * n
    for _ in range(1, m):
        for c in range(1, n):
            row[c] += row[c - 1]          # row[c]=above, row[c-1]=left
    return row[-1]
```

**Minimum path sum** — cheapest top-left to bottom-right (LeetCode #64), mutating the grid in place:
```python
def min_path_sum(grid):
    m, n = len(grid), len(grid[0])
    for r in range(m):
        for c in range(n):
            if r == 0 and c == 0:
                continue
            up   = grid[r - 1][c] if r else float('inf')
            left = grid[r][c - 1] if c else float('inf')
            grid[r][c] += min(up, left)   # cheapest way to reach here
    return grid[-1][-1]
# O(m*n) time, O(1) extra space
```

Gotcha: build 2D DP tables with `[[0]*n for _ in range(m)]` — `[[0]*n]*m` aliases one row (a classic bug from the book's grid chapter).

---
id: matrix-patterns
title: Matrix Manipulation
keywords: [matrix, 2d list, grid, rotate image, transpose, spiral traversal, spiral order, in place rotation, zip star, reverse rows, set matrix zeroes, direction arrays]
category: Data Structures
related: [prefix-sum, backtracking, bfs, dfs, graph-representation]
---
# Matrix Manipulation

Reach for these when a problem gives you an `R×C` grid. First, initialize safely — the mutable-reference trap is the #1 grid bug.

## Safe init + neighbor traversal

```python
rows, cols = 3, 4
grid = [[0] * cols for _ in range(rows)]   # each row a fresh list
# WRONG: [[0]*cols]*rows  -> all rows are the SAME object!

directions = [(0,1), (0,-1), (1,0), (-1,0)]   # right, left, down, up
def neighbors(grid, r, c):
    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]):
            yield nr, nc
```

## Transpose — swap rows/cols

```python
def transpose(m):
    return [list(row) for row in zip(*m)]   # zip(*m) pairs up columns
```

## Rotate 90° clockwise — transpose then reverse each row

```python
def rotate(matrix):                # in place, O(1) extra, n x n only
    n = len(matrix)
    for r in range(n):             # transpose across main diagonal
        for c in range(r + 1, n):
            matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
    for row in matrix:
        row.reverse()              # mirror horizontally
# One-liner (new matrix): list(zip(*matrix[::-1]))
# Counter-clockwise: transpose then reverse row order -> list(zip(*matrix))[::-1]
```

## Spiral order traversal — O(R·C)

```python
def spiral_order(matrix):
    res = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1): res.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1): res.append(matrix[r][right])
        right -= 1
        if top <= bottom:                       # guard: single row left
            for c in range(right, left - 1, -1): res.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:                       # guard: single col left
            for r in range(bottom, top - 1, -1): res.append(matrix[r][left])
            left += 1
    return res
```

Gotcha: rotating in place needs a **square** matrix; for R≠C build a new grid. See [prefix sums](#prefix-sum) for 2D range queries and [BFS](#bfs)/[DFS](#dfs) for grid traversal.

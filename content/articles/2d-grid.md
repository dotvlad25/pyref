---
id: 2d-grid
title: 2D Lists & Grid Initialization
keywords: [2d list, grid, matrix, initialization, nested list, star trap, reference, aliasing, list multiplication, direction array, neighbors, rows cols]
category: Data Structures
related: [list-basics, shallow-deep-copy, bfs, dfs, graph-representation]
---
# 2D Lists & Grid Initialization

Matrix problems are everywhere. The one thing to get right: build each row as an **independent** list.

```python
rows, cols = 3, 4

# CORRECT: comprehension re-evaluates [0]*cols fresh for each row
grid = [[0] * cols for _ in range(rows)]
grid[0][0] = 99
# [[99,0,0,0],[0,0,0,0],[0,0,0,0]]  ✓ only row 0 changed
```

## The `*`-trap (most common 2D bug)

```python
# WRONG — every row is the SAME list object in memory
bad = [[0] * cols] * rows      # rows copies of ONE reference
bad[0][0] = 99
# [[99,0,0,0],[99,0,0,0],[99,0,0,0]]  ✗ ALL rows changed!
```

`[x] * n` on a **mutable** element (a list) copies the *reference*, not the value. `[0]*cols` is fine — ints are immutable. The nesting is what bites. The comprehension avoids it by creating a distinct inner list each iteration. Same root cause as the [shallow copy trap](#shallow-deep-copy).

## Dimensions & traversal

```python
R, C = len(grid), len(grid[0])          # rows, cols
for r in range(R):
    for c in range(C):
        val = grid[r][c]
```

## Direction arrays — the grid BFS/DFS idiom

```python
# right, left, down, up
directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]

def neighbors(grid, r, c):
    out = []
    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]):   # in-bounds check
            out.append((nr, nc))
    return out
```

Use this for [BFS](#bfs) / [DFS](#dfs) over grids. Copying a grid needs [`deepcopy`](#shallow-deep-copy) — `grid[:]` shares the rows.

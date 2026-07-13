---
id: grid-traversal
title: Grid/Matrix Traversal
keywords: [grid, matrix, 2d array, islands, number of islands, flood fill, dfs, bfs, direction array, neighbors, four directions, eight directions, in bounds, visited]
category: Algorithms
type: pattern
related: [bfs, dfs, connected-components, union-find, word-ladder-bfs]
---
# Grid/Matrix Traversal

Treat each cell as a graph node whose neighbors are the adjacent cells. Traversal is [BFS](#bfs) or [DFS](#dfs) with an **in-bounds check**. Time **O(rows·cols)**.

## Direction arrays

```python
DIRS4 = [(0,1),(0,-1),(1,0),(-1,0)]                  # right left down up
DIRS8 = DIRS4 + [(1,1),(1,-1),(-1,1),(-1,-1)]        # add diagonals
```

## Count islands (BFS)

```python
from collections import deque

def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    visited, count = set(), 0

    def bfs(r, c):
        q = deque([(r, c)])
        visited.add((r, c))
        while q:
            row, col = q.popleft()
            for dr, dc in DIRS4:
                nr, nc = row + dr, col + dc
                if (0 <= nr < rows and 0 <= nc < cols     # bounds first!
                        and grid[nr][nc] == "1"
                        and (nr, nc) not in visited):
                    visited.add((nr, nc))                 # mark on enqueue
                    q.append((nr, nc))

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in visited:
                bfs(r, c)
                count += 1                                # each launch = 1 island
    return count
```

## Flood fill (DFS)

```python
def flood_fill(grid, sr, sc, new):
    rows, cols = len(grid), len(grid[0])
    old = grid[sr][sc]
    if old == new:
        return grid                    # gotcha: else infinite recursion
    def dfs(r, c):
        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] != old:
            return
        grid[r][c] = new
        for dr, dc in DIRS4:
            dfs(r + dr, c + dc)
    dfs(sr, sc)
    return grid
```

Recursive DFS recurses up to O(rows·cols) deep, so a large all-land grid can hit Python's default recursion limit (~1000) — use the iterative BFS above for big grids.

Mutating the grid in place (mark `"1"→"0"`) avoids a separate `visited` set. This is [connected components](#connected-components) on an implicit grid graph.

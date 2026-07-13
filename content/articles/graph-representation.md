---
id: graph-representation
title: Graph Representation
keywords: [graph, adjacency list, adjacency matrix, defaultdict, edges, directed, undirected, weighted, build graph]
category: Algorithms
type: pattern
related: [bfs, dfs, dijkstra, topological-sort, defaultdict]
---
# Graph Representation

The **adjacency list** is the common default — O(V + E) space and fast neighbor iteration.

## Adjacency list with defaultdict

```python
from collections import defaultdict

graph = defaultdict(list)
for u, v in edges:
    graph[u].append(v)
    graph[v].append(u)      # omit this line for a DIRECTED graph
```

## Weighted graph

```python
graph = defaultdict(list)
for u, v, w in weighted_edges:
    graph[u].append((v, w))
    graph[v].append((u, w))   # undirected
```

This `(neighbor, weight)` shape is exactly what [Dijkstra](#dijkstra) consumes.

## Grid as an implicit graph

Many problems are grids where neighbors are the 4 (or 8) adjacent cells:

```python
def neighbors(r, c, rows, cols):
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols:
            yield nr, nc
```

## Adjacency matrix

`matrix[u][v] = 1` (or weight). O(V²) space — only for dense graphs or O(1) edge-existence checks.

```python
matrix = [[0] * n for _ in range(n)]
for u, v in edges:
    matrix[u][v] = matrix[v][u] = 1
```

Feed either representation into [BFS](#bfs), [DFS](#dfs), or [topological sort](#topological-sort).

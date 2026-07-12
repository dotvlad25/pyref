---
id: connected-components
title: Connected Components
keywords: [connected components, count components, number of components, islands, dfs, bfs, union find, undirected graph, groups, clusters]
category: Algorithms
related: [union-find, bfs, dfs, grid-traversal, graph-representation]
---
# Connected Components

Count the number of separate "pieces" in an **undirected** graph. Start a fresh traversal from every unvisited node — each launch is one component. Time **O(V + E)**.

## DFS/BFS count

```python
def count_components(n, edges):
    graph = {i: [] for i in range(n)}
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)             # undirected → both directions

    visited = set()
    def dfs(node):
        visited.add(node)
        for nb in graph[node]:
            if nb not in visited:
                dfs(nb)

    count = 0
    for node in range(n):
        if node not in visited:        # a new, untouched piece
            dfs(node)
            count += 1
    return count
```

Each unvisited node triggers a full traversal of its component, then the outer loop skips everything already marked. Swap `dfs` for an iterative [BFS](#bfs) if recursion depth is a concern.

## Union-Find alternative

Cleaner when edges arrive incrementally or you only need the count:

```python
def count_components(n, edges):        # LeetCode 323
    uf = UnionFind(n)                  # see union-find
    for u, v in edges:
        uf.union(u, v)
    return uf.components               # decremented on each merge
```

For components inside a matrix (islands), see [grid traversal](#grid-traversal). Same skeleton powers [cycle detection](#cycle-detection) and [bipartite checks](#bipartite).

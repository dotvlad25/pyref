---
id: cycle-detection
title: Cycle Detection
keywords: [cycle detection, detect cycle, directed graph, undirected graph, back edge, three color, white gray black, dfs, parent, union find, deadlock, dependency cycle]
category: Algorithms
type: algo
related: [topological-sort, union-find, dfs, connected-components, graph-representation]
---
# Cycle Detection

Detecting a cycle differs by graph type. Both run in **O(V + E)**.

## Directed graph — 3-color DFS

A cycle exists if DFS reaches a node currently **on the recursion stack** (a back edge). Track three states.

```python
def has_cycle_directed(graph, nodes):
    WHITE, GRAY, BLACK = 0, 1, 2        # unseen / in-progress / done
    color = {n: WHITE for n in nodes}

    def dfs(u):
        color[u] = GRAY
        for v in graph[u]:
            if color[v] == GRAY:        # back edge → cycle
                return True
            if color[v] == WHITE and dfs(v):
                return True
        color[u] = BLACK                # fully explored
        return False

    return any(color[n] == WHITE and dfs(n) for n in nodes)
```

Alternatively, run [Kahn's topological sort](#topological-sort): if the output omits any node, a directed cycle exists.

## Undirected graph — parent tracking

Any edge back to an already-visited node that **isn't the one you came from** is a cycle.

```python
def has_cycle_undirected(graph, nodes):
    visited = set()
    def dfs(u, parent):
        visited.add(u)
        for v in graph[u]:
            if v not in visited:
                if dfs(v, u):
                    return True
            elif v != parent:           # visited & not parent → cycle
                return True
        return False
    return any(n not in visited and dfs(n, None) for n in nodes)
```

## Union-Find (undirected)

```python
def has_cycle(n, edges):               # LeetCode 684
    uf = UnionFind(n)                  # see union-find
    for u, v in edges:
        if not uf.union(u, v):         # endpoints already connected
            return True
    return False
```

Gotcha: never reuse the undirected "parent" trick on a directed graph — direction matters, so use colors there.

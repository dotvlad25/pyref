---
id: bipartite
title: Bipartite Check
keywords: [bipartite, two coloring, 2-coloring, graph coloring, bfs, odd cycle, possible bipartition, is graph bipartite, red blue, two sets]
category: Algorithms
related: [bfs, dfs, connected-components, cycle-detection, graph-representation]
---
# Bipartite Check

A graph is **bipartite** if nodes split into two sets with no edge inside a set — equivalently, it is **2-colorable** / has no odd-length cycle. BFS-color each component; conflict means not bipartite. Time **O(V + E)**.

## BFS 2-coloring

```python
from collections import deque

def is_bipartite(graph, n):
    color = [-1] * n                   # -1 = uncolored
    for start in range(n):
        if color[start] != -1:
            continue                   # already handled in a prior BFS
        color[start] = 0
        q = deque([start])
        while q:
            u = q.popleft()
            for v in graph[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]    # opposite color
                    q.append(v)
                elif color[v] == color[u]:     # same color across edge
                    return False               # → odd cycle, not bipartite
    return True
```

**Loop over every start** — the graph may be disconnected, so each component needs its own seeding. `1 - color[u]` flips 0↔1.

## DFS variant

```python
def is_bipartite_dfs(graph, n):
    color = [-1] * n
    def dfs(u, c):
        color[u] = c
        for v in graph[u]:
            if color[v] == c:          # neighbor shares color
                return False
            if color[v] == -1 and not dfs(v, 1 - c):
                return False
        return True
    return all(color[i] != -1 or dfs(i, 0) for i in range(n))
```

Reach for this on "split into two teams", "possible bipartition", or graph-coloring prompts (LeetCode 785, 886). A clean [connected-component](#connected-components) sweep with a coloring twist.

---
id: topological-sort
title: Topological Sort (Kahn's Algorithm)
keywords: [topological sort, topo sort, kahn, indegree, dag, dependency, ordering, cycle detection, course schedule]
category: Algorithms
type: algo
related: [bfs, dfs, graph-representation, deque]
---
# Topological Sort (Kahn's Algorithm)

Linear ordering of a **DAG** where every edge u→v puts u before v. Used for dependency/build ordering and course scheduling. Time **O(V + E)**.

## Kahn's algorithm (BFS on in-degrees)

```python
from collections import deque, defaultdict

def topo_sort(graph, nodes):
    indegree = {n: 0 for n in nodes}
    for u in graph:
        for v in graph[u]:
            indegree[v] += 1

    q = deque(n for n in nodes if indegree[n] == 0)   # start with no-deps
    order = []
    while q:
        node = q.popleft()
        order.append(node)
        for nb in graph[node]:
            indegree[nb] -= 1          # "remove" the edge
            if indegree[nb] == 0:
                q.append(nb)

    if len(order) != len(nodes):
        return None                    # a cycle exists — no valid ordering
    return order
```

## Key idea

Repeatedly emit nodes with **in-degree 0**, then decrement their neighbors' in-degrees. If you can't emit all nodes, the graph has a **cycle**.

## DFS alternative

Post-order DFS, then reverse the finish order:

```python
def topo_dfs(graph, nodes):
    visited, order = set(), []
    def dfs(u):
        visited.add(u)
        for v in graph[u]:
            if v not in visited:
                dfs(v)
        order.append(u)         # add AFTER visiting all descendants
    for n in nodes:
        if n not in visited:
            dfs(n)
    return order[::-1]
```

Kahn's also doubles as cycle detection — see [graph representation](#).

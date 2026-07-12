---
id: bfs
title: Breadth-First Search (BFS)
keywords: [bfs, breadth first search, queue, deque, shortest path, level order, graph, traversal, visited]
category: Algorithms
type: algo
related: [dfs, deque, graph-representation, topological-sort, dijkstra]
---
# Breadth-First Search (BFS)

BFS explores level by level using a **queue** ([`deque`](#)). On an unweighted graph it finds the **shortest path** (fewest edges). Time **O(V + E)**.

```python
from collections import deque

def bfs(graph, start):
    visited = {start}
    q = deque([start])
    while q:
        node = q.popleft()              # O(1) — never use list.pop(0)
        for nb in graph[node]:
            if nb not in visited:
                visited.add(nb)         # mark on ENQUEUE, not dequeue
                q.append(nb)
    return visited
```

**Mark visited when you enqueue**, not when you dequeue — otherwise a node can be added multiple times before it's processed.

## Shortest path length (unweighted)

```python
def shortest_path(graph, start, target):
    q = deque([(start, 0)])
    visited = {start}
    while q:
        node, dist = q.popleft()
        if node == target:
            return dist
        for nb in graph[node]:
            if nb not in visited:
                visited.add(nb)
                q.append((nb, dist + 1))
    return -1
```

## Level-by-level (process each layer)

```python
while q:
    for _ in range(len(q)):     # snapshot the current level's size
        node = q.popleft()
        ...                      # add children for the next level
```

For weighted shortest paths, use [Dijkstra](#) instead.

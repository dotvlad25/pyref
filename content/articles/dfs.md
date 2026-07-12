---
id: dfs
title: Depth-First Search (DFS)
keywords: [dfs, depth first search, recursion, stack, graph, traversal, visited, backtracking, connected components]
category: Algorithms
type: algo
related: [bfs, graph-representation, topological-sort, recursion-memoization]
---
# Depth-First Search (DFS)

DFS goes as deep as possible before backtracking. Time **O(V + E)**.

## Recursive (cleanest)

```python
def dfs(graph, node, visited):
    visited.add(node)
    for nb in graph[node]:
        if nb not in visited:
            dfs(graph, nb, visited)

visited = set()
dfs(graph, start, visited)
```

Watch the recursion limit on deep graphs (`sys.setrecursionlimit`), or go iterative.

## Iterative (explicit stack)

```python
def dfs_iter(graph, start):
    visited = set()
    stack = [start]
    while stack:
        node = stack.pop()          # LIFO
        if node in visited:
            continue
        visited.add(node)           # mark on POP (dedup handled by the check above)
        for nb in graph[node]:
            if nb not in visited:
                stack.append(nb)
    return visited
```

## Counting connected components

```python
def count_components(graph, nodes):
    visited = set()
    count = 0
    for n in nodes:
        if n not in visited:
            count += 1
            dfs(graph, n, visited)    # flood-fill one whole component
    return count
```

## BFS vs DFS

- **Shortest path (unweighted)** → [BFS](#).
- **Explore all / detect cycles / topological order / backtracking** → DFS.

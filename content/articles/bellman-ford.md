---
id: bellman-ford
title: Bellman-Ford
keywords: [bellman ford, shortest path, negative edges, negative weights, negative cycle, relaxation, v minus 1, single source, cheapest flights]
category: Algorithms
related: [dijkstra, bfs, cycle-detection, graph-representation, topological-sort]
---
# Bellman-Ford

Single-source shortest paths that **handles negative edge weights** — where [Dijkstra](#dijkstra) fails. Relax every edge V−1 times. Time **O(V·E)**, space **O(V)**.

```python
def bellman_ford(n, edges, src):
    # edges: list of (u, v, w), directed
    dist = [float('inf')] * n
    dist[src] = 0

    for _ in range(n - 1):             # V-1 rounds is enough for any path
        updated = False
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                updated = True
        if not updated:                # early exit: nothing changed
            break
    return dist
```

**Why V−1?** A shortest path visits at most V nodes, so it has ≤ V−1 edges; one relaxation round can extend every path by one edge.

## Negative-cycle detection

If any edge still relaxes on a V-th pass, a reachable **negative cycle** exists (shortest paths become −∞).

```python
def has_negative_cycle(n, edges, src):
    dist = bellman_ford(n, edges, src)
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            return True                # still improving → negative cycle
    return False
```

## When to use which

```python
# non-negative weights  → Dijkstra   O((V+E) log V)   (faster)
# negative weights       → Bellman-Ford  O(V·E)
# unweighted             → BFS         O(V+E)
# at-most-K edges (LC787)→ Bellman-Ford, capped at K+1 rounds on a dist copy
```

Gotcha: guard `dist[u] != inf` before relaxing, or `inf + w` corrupts unreachable nodes.

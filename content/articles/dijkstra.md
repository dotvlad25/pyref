---
id: dijkstra
title: Dijkstra's Shortest Path
keywords: [dijkstra, shortest path, weighted graph, priority queue, heapq, distances, greedy, relaxation]
category: Algorithms
type: algo
related: [heapq, heap-tuples, bfs, graph-representation]
---
# Dijkstra's Shortest Path

Single-source shortest paths on a graph with **non-negative** weights, using a [min-heap](#). Time **O((V + E) log V)**.

```python
import heapq

def dijkstra(graph, start):
    # graph: {node: [(neighbor, weight), ...]}
    dist = {start: 0}
    pq = [(0, start)]                    # (distance_so_far, node)

    while pq:
        d, node = heapq.heappop(pq)
        if d > dist.get(node, float("inf")):
            continue                     # stale entry — already found better
        for nb, w in graph.get(node, ()):   # .get avoids KeyError on sink nodes
            nd = d + w
            if nd < dist.get(nb, float("inf")):
                dist[nb] = nd
                heapq.heappush(pq, (nd, nb))
    return dist
```

## Key points

- Push `(distance, node)` tuples so the heap orders by distance — the [heap-with-tuples](#) pattern.
- **Lazy deletion:** don't remove outdated entries; skip them with the `d > dist[node]` check when popped.
- Requires **non-negative** weights. With negative edges, use Bellman-Ford instead.

## Reconstructing the path

```python
prev = {}
# on relaxation: prev[nb] = node
def path(target):
    out = []
    while target is not None:
        out.append(target)
        target = prev.get(target)
    return out[::-1]
```

For unweighted graphs, plain [BFS](#) already gives shortest paths — no heap needed.

---
id: union-find
title: Union-Find (Disjoint Set)
keywords: [union find, disjoint set, dsu, disjoint set union, path compression, union by rank, connected, components, cycle, redundant connection, alpha inverse ackermann]
category: Data Structures
type: algo
related: [connected-components, cycle-detection, graph-representation, topological-sort, bfs]
---
# Union-Find (Disjoint Set)

Tracks which elements share a **connected component**. Answers "are these two connected?" in near-**O(1)** after O(n) setup. Reach for it for connectivity, cycle detection, and grouping — especially with many queries or incrementally added edges.

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))   # each node is its own root
        self.rank = [0] * n
        self.components = n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False               # already connected → would form a cycle
        if self.rank[px] < self.rank[py]:
            px, py = py, px            # union by rank: small under large
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        self.components -= 1
        return True

    def connected(self, x, y):
        return self.find(x) == self.find(y)
```

Both optimizations together give amortized **O(α(n)) ≈ O(1)** per op (α = inverse Ackermann). Without them, `find` degrades to O(n).

## Typical uses

```python
def count_components(n, edges):        # LeetCode 323
    uf = UnionFind(n)
    for u, v in edges:
        uf.union(u, v)
    return uf.components

def has_cycle(n, edges):               # undirected: LeetCode 684
    uf = UnionFind(n)
    for u, v in edges:
        if not uf.union(u, v):         # endpoints already linked
            return True
    return False
```

Prefer [BFS/DFS](#bfs) for one-off traversal; Union-Find wins for repeated connectivity queries. See [connected components](#connected-components) and [cycle detection](#cycle-detection).

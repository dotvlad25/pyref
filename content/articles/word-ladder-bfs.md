---
id: word-ladder-bfs
title: Shortest Transformation (BFS)
keywords: [word ladder, shortest transformation, implicit graph, bfs, word list, one letter change, transformation sequence, state space search, patterns, wildcard]
category: Algorithms
related: [bfs, grid-traversal, connected-components, graph-representation, dfs]
---
# Shortest Transformation (BFS)

When "states" are connected by single-step moves, model them as an **implicit graph** and run [BFS](#bfs) for the fewest steps — no explicit adjacency list needed. Classic case: word ladder (LeetCode 127).

## Word ladder — length of shortest chain

```python
from collections import deque

def ladder_length(begin, end, word_list):
    words = set(word_list)             # O(1) membership
    if end not in words:
        return 0
    q = deque([(begin, 1)])            # (word, steps)
    visited = {begin}
    while q:
        word, steps = q.popleft()
        if word == end:
            return steps
        for i in range(len(word)):     # generate neighbors on the fly
            for ch in "abcdefghijklmnopqrstuvwxyz":
                nxt = word[:i] + ch + word[i+1:]
                if nxt in words and nxt not in visited:
                    visited.add(nxt)   # mark on enqueue (avoids re-adds)
                    q.append((nxt, steps + 1))
    return 0                           # no path
```

Neighbors = words one letter apart. Generating them costs **O(L²·26)** per word (L·26 candidate strings, each O(L) to build and hash); total **O(N·L²·26)**.

## Speedup: wildcard buckets

Precompute a pattern map so neighbor lookup is O(L) instead of O(L·26):

```python
from collections import defaultdict
patterns = defaultdict(list)
for w in words:
    for i in range(len(w)):
        patterns[w[:i] + "*" + w[i+1:]].append(w)   # "h*t" -> [hot, hit]
```

Gotchas: BFS (not DFS) guarantees the **shortest** chain; mark visited on enqueue. Same implicit-graph BFS underlies open-lock, min-genetic-mutation, and sliding-puzzle problems.

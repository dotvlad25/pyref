---
id: defaultdict
title: collections.defaultdict
keywords: [defaultdict, collections, default factory, grouping, adjacency list, int, list, set, autovivification]
category: Data Structures
related: [grouping, dict, counter, trie, graph-representation]
---
# collections.defaultdict

A `dict` that auto-creates a default value on first access to a missing key. Eliminates `if key not in d` boilerplate.

```python
from collections import defaultdict

# Counting
counts = defaultdict(int)
for ch in "banana":
    counts[ch] += 1          # missing key starts at 0

# Grouping into lists
groups = defaultdict(list)
for name, team in pairs:
    groups[team].append(name)   # missing key starts as []

# Sets (e.g. adjacency for a graph)
graph = defaultdict(set)
for u, v in edges:
    graph[u].add(v)
    graph[v].add(u)
```

The argument is a **factory** (a callable). `int` → `0`, `list` → `[]`, `set` → `set()`.

## Gotcha: reads create keys

Merely *accessing* a missing key inserts it:

```python
d = defaultdict(list)
_ = d["never_set"]      # this ADDS "never_set": [] to the dict
```

Use `d.get(k)` when you want to check without inserting.

## Nested / recursive defaultdict (Trie)

```python
trie = lambda: defaultdict(trie)
root = trie()
root["c"]["a"]["t"]["$"] = True    # builds nested dicts on demand
```

This is the one-liner backbone of a [Trie](#).

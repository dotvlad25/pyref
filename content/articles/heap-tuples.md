---
id: heap-tuples
title: Heap with Tuples & Custom Priority
keywords: [heap, tuple, priority, heapq, custom comparator, tie breaker, counter, dataclass, order]
category: Data Structures
related: [heapq, top-k, dijkstra, sorting-key]
---
# Heap with Tuples & Custom Priority

To attach a payload to a heap entry, push `(priority, payload)` tuples. Python compares tuples lexicographically, so it orders by `priority` first.

```python
import heapq

tasks = []
heapq.heappush(tasks, (2, "email"))
heapq.heappush(tasks, (1, "deploy"))
heapq.heappush(tasks, (3, "cleanup"))

priority, name = heapq.heappop(tasks)   # (1, "deploy")
```

## The tie-break problem

If two priorities are equal, Python compares the *next* tuple element. If that's an object without ordering, you get `TypeError`. Fix it with a monotonic counter as a tie-breaker:

```python
import itertools
counter = itertools.count()

def push(heap, priority, item):
    # (priority, insertion_order, item): the counter is unique, so `item`
    # is never compared even when priorities collide.
    heapq.heappush(heap, (priority, next(counter), item))
```

## Ordering custom objects directly

Make the class orderable with a dataclass:

```python
from dataclasses import dataclass, field

@dataclass(order=True)
class PQItem:
    priority: int
    item: object = field(compare=False)   # excluded from comparison
```

This is the exact tuple pattern used in [Dijkstra's algorithm](#).

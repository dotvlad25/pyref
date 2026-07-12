---
id: lazy-deletion-heap
title: Lazy Deletion in Heaps
keywords: [lazy deletion, heap, heapq, decrease-key, delete from heap, remove arbitrary, heappushpop, heapreplace, invalidate, stale entry, priority queue update, sliding window, task scheduler]
category: Algorithms
type: pattern
related: [heapq, heap-tuples, top-k, merge-k-sorted-lists, two-heap-median, dijkstra, sliding-window]
---
# Lazy Deletion in Heaps

Python's `heapq` has no efficient delete-arbitrary or decrease-key. Workaround: don't remove — mark an entry stale and **skip it when it surfaces at the top**. Used in schedulers with cancellations, sliding-window mins/maxes, and [dijkstra](#dijkstra) with outdated distances.

```python
import heapq

heap = []                 # entries: (priority, item)
entry_valid = {}          # item -> current priority (source of truth)

def push(item, prio):
    entry_valid[item] = prio
    heapq.heappush(heap, (prio, item))     # old entries linger, ignored later

def delete(item):
    entry_valid.pop(item, None)            # just forget it; no heap removal

def update(item, prio):                     # simulate decrease/increase-key
    push(item, prio)                        # push new; old becomes stale

def pop_min():
    while heap:
        prio, item = heapq.heappop(heap)    # O(log n)
        # valid iff still tracked AND priority matches the latest push
        if entry_valid.get(item) == prio:
            del entry_valid[item]
            return item, prio
    raise KeyError("empty")
```

Amortized O(log n) per op; heap may hold stale entries so space is O(number of pushes). Fine when total pushes are bounded.

Two atomic combos avoid a separate push+pop (each O(log n), but one heapify pass, and no transient size change):

```python
import heapq
h = [1, 3, 5]; heapq.heapify(h)
heapq.heappushpop(h, 2)   # push 2 THEN pop min -> 1  (may return the pushed item)
heapq.heapreplace(h, 4)   # pop min THEN push 4  -> returns 2 (never the new item)
```

- `heappushpop(h, x)`: if `x <= h[0]`, returns `x` unchanged (heap untouched).
- `heapreplace(h, x)`: always pops first, so heap must be non-empty.

```python
# Sliding-window max via lazy deletion: pop tops that fell out of the window.
import heapq
def window_max(nums, k):
    h, out = [], []
    for i, x in enumerate(nums):
        heapq.heappush(h, (-x, i))          # max-heap: negate (see [heapq](#heapq))
        while h[0][1] <= i - k:             # top's index expired -> discard
            heapq.heappop(h)
        if i >= k - 1:
            out.append(-h[0][0])
    return out
```

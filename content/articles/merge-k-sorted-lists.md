---
id: merge-k-sorted-lists
title: Merge K Sorted Lists
keywords: [merge k sorted lists, heapq, heappush, heappop, min-heap, priority queue, merge, heapq.merge, k-way merge, sorted, iterator, tie-breaker, leetcode 23]
category: Algorithms
related: [heapq, heap-tuples, top-k, lazy-deletion-heap, two-heap-median, linked-list, mergesort]
---
# Merge K Sorted Lists

Classic heap pattern: keep a heap of one candidate per list (its head). Pop the min, push the next element from the same list. O(n log k) time, O(k) heap space (n = total elements).

```python
import heapq

# Push (value, list_index, elem_index). Index tuple tracks where to advance
# AND breaks value ties without comparing raw payloads (see [heap-tuples](#heap-tuples)).
def merge_k_sorted(lists):
    h = []
    for i, lst in enumerate(lists):
        if lst:                       # skip empty lists
            heapq.heappush(h, (lst[0], i, 0))
    result = []
    while h:
        val, i, j = heapq.heappop(h)  # O(log k)
        result.append(val)
        if j + 1 < len(lists[i]):     # advance that list only
            heapq.heappush(h, (lists[i][j + 1], i, j + 1))
    return result

merge_k_sorted([[1, 4, 7], [2, 5, 8], [3, 6, 9]])  # [1..9]
```

When inputs are already sorted, `heapq.merge()` is the one-liner — lazy (returns an iterator), memory-efficient, same O(n log k):

```python
import heapq
result = list(heapq.merge([1, 4, 7], [2, 5, 8], [3, 6, 9]))
# [1, 2, 3, 4, 5, 6, 7, 8, 9]
# heapq.merge(*lists, key=..., reverse=...) also supported.
```

Use the manual heap when you need index tracking or the lists aren't plain sequences (e.g. [linked-list](#linked-list) nodes). Use `heapq.merge()` otherwise — cleaner and streams huge inputs.

```python
# Linked-list variant: push node itself is unsafe (no __lt__ on ties),
# so include a counter tie-breaker.
import heapq, itertools
def merge_lists(heads):
    ctr = itertools.count()
    h = [(n.val, next(ctr), n) for n in heads if n]
    heapq.heapify(h)
    dummy = tail = Node(0)
    while h:
        _, _, node = heapq.heappop(h)
        tail.next = node; tail = node
        if node.next:
            heapq.heappush(h, (node.next.val, next(ctr), node.next))
    return dummy.next
```

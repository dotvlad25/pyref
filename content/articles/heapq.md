---
id: heapq
title: heapq (Priority Queue)
keywords: [heapq, heap, priority queue, min heap, max heap, heappush, heappop, heapify, nlargest, nsmallest, top k]
category: Data Structures
type: reference
related: [heap-tuples, top-k, two-heap-median, lazy-deletion-heap, task-manager, deque, dijkstra]
---
# heapq (Priority Queue)

`heapq` is a **binary min-heap** over a plain list. Smallest element is always at index 0. Push/pop are **O(log N)**, `heapify` is **O(N)**.

```python
import heapq

nums = [5, 1, 8, 3]
heapq.heapify(nums)          # O(N), in place -> [1, 3, 8, 5]

heapq.heappush(nums, 2)      # O(log N)
smallest = heapq.heappop(nums)   # O(log N) -> 1

# Push then pop (more efficient than separate calls)
heapq.heappushpop(nums, 4)   # push 4, then pop-and-return smallest
heapq.heapreplace(nums, 4)   # pop smallest first, then push 4
```

## Max-heap trick

Python has no max-heap. Negate the values:

```python
h = []
for x in [5, 1, 8]:
    heapq.heappush(h, -x)
largest = -heapq.heappop(h)   # 8
```

## Top-K without a full sort

```python
heapq.nlargest(3, nums)      # 3 largest
heapq.nsmallest(3, nums)     # 3 smallest
heapq.nlargest(3, people, key=lambda p: p.age)   # with key
```

For carrying a payload alongside the priority, see [heap with tuples](#heap-tuples). For the running-median pattern, see [two-heap median](#two-heap-median).

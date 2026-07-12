---
id: top-k
title: Top-K Elements
keywords: [top k, k largest, k smallest, k most frequent, heapq, nlargest, counter, quickselect, kth largest]
category: Patterns
related: [heapq, heap-tuples, counter, sorting-key]
---
# Top-K Elements

## K most frequent (Counter + heap)

```python
from collections import Counter
import heapq

def top_k_frequent(nums, k):
    counts = Counter(nums)
    return [x for x, _ in counts.most_common(k)]   # O(N log k) under the hood
```

`Counter.most_common(k)` already uses a heap — reach for it first.

## K largest by a key (heapq.nlargest)

```python
import heapq
heapq.nlargest(k, people, key=lambda p: p.score)
heapq.nsmallest(k, people, key=lambda p: p.score)
```

`nlargest`/`nsmallest` are **O(N log k)** — better than sorting all N when k ≪ N.

## Kth largest with a size-k min-heap

Keep only k elements: the heap's smallest (root) is the kth largest so far.

```python
import heapq

def kth_largest(nums, k):
    h = nums[:k]
    heapq.heapify(h)
    for x in nums[k:]:
        if x > h[0]:
            heapq.heapreplace(h, x)   # pop smallest, push x
    return h[0]
```

This uses **O(k)** space — ideal for streams too large to sort.

## When to just sort

If k is close to N, or you need the full order anyway, `sorted(...)[:k]` at O(N log N) is simplest and fast enough.

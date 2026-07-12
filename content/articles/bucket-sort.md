---
id: bucket-sort
title: Bucket Sort
keywords: [bucket sort, distribution sort, buckets, uniform distribution, O(n) average, floats in range, top k frequent, sort by frequency, counting sort]
category: Algorithms
related: [counting-sort, sorting-key, top-k, counter]
---
# Bucket Sort

Reach for this when input is **uniformly distributed over a known range** (e.g. floats in [0, 1)) — **average O(n)**, worst O(n²) if everything lands in one bucket. Also a clean trick for **"top k frequent"** where the frequency itself is a bounded index.

Scatter items into buckets by value range, sort each bucket, then concatenate.

```python
def bucket_sort(nums):
    """nums: floats in [0, 1). Average O(n)."""
    if not nums:
        return nums
    n = len(nums)
    buckets = [[] for _ in range(n)]
    for x in nums:
        buckets[int(n * x)].append(x)    # index by value range
    out = []
    for b in buckets:
        b.sort()                         # small buckets -> cheap
        out.extend(b)
    return out
```

## Frequency-bucket pattern (LeetCode #347 Top K Frequent)

Index buckets by **count**, not value — no sorting needed, O(n).

```python
from collections import Counter

def top_k_frequent(nums, k):
    freq = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]   # index = frequency
    for val, c in freq.items():
        buckets[c].append(val)
    out = []
    for c in range(len(buckets) - 1, 0, -1):       # high freq first
        out.extend(buckets[c])
        if len(out) >= k:
            return out[:k]
    return out
```

## Gotchas

```python
# - Skewed data -> one giant bucket -> O(n^2). Only "avg O(n)".
# - Choosing bucket count/width is the whole game; too few = slow.
```

When keys are dense small integers, [counting sort](#counting-sort) is simpler; for general top-k a [heap](#top-k) works too.

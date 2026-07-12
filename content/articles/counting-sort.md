---
id: counting-sort
title: Counting Sort
keywords: [counting sort, non comparison sort, bounded integers, O(n+k), stable, frequency count, radix sort building block, sort colors, bucket]
category: Algorithms
related: [bucket-sort, counter, sorting-key, top-k]
---
# Counting Sort

Reach for this when keys are **integers in a small, known range [0, k]** — it beats the O(n log n) comparison lower bound with **O(n + k)** time and **O(k)** space. Useful when k is comparable to n; wasteful when the range is huge.

Count occurrences, then emit each value that many times.

```python
def counting_sort(nums, k):
    """Sort ints in range [0, k] inclusive."""
    count = [0] * (k + 1)
    for x in nums:
        count[x] += 1                # tally frequencies  -> O(n)
    out = []
    for v in range(k + 1):
        out.extend([v] * count[v])   # emit in value order -> O(n+k)
    return out
```

## Stable version (needed for radix sort / sorting records by key)

Prefix-sum the counts into positions, then place from the right to preserve input order of equal keys.

```python
def counting_sort_stable(items, key, k):
    count = [0] * (k + 1)
    for it in items:
        count[key(it)] += 1
    for v in range(1, k + 1):
        count[v] += count[v - 1]     # count[v] = end index for key v
    out = [None] * len(items)
    for it in reversed(items):       # reversed -> stability
        v = key(it)
        count[v] -= 1
        out[count[v]] = it
    return out
```

## Gotchas

```python
# - Range must be known & small; k=10**9 blows up memory.
# - For arbitrary hashable keys (not dense ints), use a Counter instead.
# - Negative values: shift by -min(nums) before indexing.
```

Compare with [bucket sort](#bucket-sort) (distributes into ranges, sorts each) and [Counter](#counter) for frequency maps.

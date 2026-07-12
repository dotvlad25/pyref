---
id: prefix-sum
title: Prefix Sums
keywords: [prefix sum, prefix sums, cumulative sum, running total, range sum query, accumulate, subarray sum, 2d prefix, integral image, subarray sum equals k]
category: Algorithms
related: [two-pointers, sliding-window, counter, matrix-patterns]
---
# Prefix Sums

Reach for this when you need **many range-sum queries** or **"count subarrays with sum k"**. Precompute cumulative sums once in **O(N)**, then each range query is **O(1)**.

## Build + range query

```python
import itertools
nums = [1, 2, 3, 4, 5]
prefix = list(itertools.accumulate(nums))  # [1, 3, 6, 10, 15]

def range_sum(prefix, l, r):               # inclusive sum nums[l..r]
    return prefix[r] - (prefix[l-1] if l > 0 else 0)
```

Prefer a length-(N+1) array to kill the `l > 0` special case:

```python
pre = [0] * (len(nums) + 1)
for i, x in enumerate(nums):
    pre[i+1] = pre[i] + x
# sum of nums[l..r] inclusive == pre[r+1] - pre[l]
```

## Subarray sum equals k — O(N)

Count contiguous subarrays summing to `k` using a running sum + hash map of seen prefixes.

```python
from collections import defaultdict
def subarray_sum(nums, k):
    seen = defaultdict(int)
    seen[0] = 1                 # empty prefix
    total = count = 0
    for x in nums:
        total += x
        count += seen[total - k]  # a prior prefix makes a window summing to k
        seen[total] += 1
    return count
```

## 2D prefix sum (integral image) — O(1) rectangle queries

```python
def build_2d(m):
    R, C = len(m), len(m[0])
    pre = [[0]*(C+1) for _ in range(R+1)]
    for r in range(R):
        for c in range(C):
            pre[r+1][c+1] = (m[r][c] + pre[r][c+1]
                             + pre[r+1][c] - pre[r][c])  # inclusion-exclusion
    return pre

def region_sum(pre, r1, c1, r2, c2):   # inclusive corners
    return (pre[r2+1][c2+1] - pre[r1][c2+1]
            - pre[r2+1][c1] + pre[r1][c1])
```

Related: [sliding window](#sliding-window) for positive-only windows, [counter](#counter) / [defaultdict](#defaultdict) for the hash-map count.

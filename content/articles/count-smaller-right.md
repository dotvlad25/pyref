---
id: count-smaller-right
title: Count Smaller to the Right
keywords: [count smaller after self, count smaller to the right, count inversions, merge sort count, fenwick count, bisect insort, right smaller elements, leetcode 315]
category: Algorithms
type: algo
related: [fenwick-tree, coordinate-compression, mergesort, bisect, binary-search]
---
# Count Smaller to the Right

For each element, count how many elements to its right are strictly smaller. `[5,2,6,1] → [2,1,1,0]`. It's the **count-inversions** pattern; four approaches, increasing in polish.

## Brute force — O(n²)

```python
def count_smaller_brute(nums):
    n = len(nums)
    res = [0] * n
    for i in range(n):
        for j in range(i + 1, n):
            if nums[j] < nums[i]:
                res[i] += 1
    return res
```

Fine to state first, then "can we do better?" → yes, O(n log n).

## bisect — fewest lines

Walk right-to-left, keep a sorted list of seen elements; the insertion point *is* the count of smaller-so-far.

```python
import bisect

def count_smaller_bisect(nums):
    res, seen = [0] * len(nums), []
    for i in range(len(nums) - 1, -1, -1):
        pos = bisect.bisect_left(seen, nums[i])   # how many already-seen are smaller
        res[i] = pos
        seen.insert(pos, nums[i])                 # keep sorted
    return res
```

O(n log n) for the searches, but `insert` shifts are O(n) → O(n²) worst case. Shortest to write; often good enough.

## Fenwick tree — clean O(n log n)

Compress values to ranks, then sweep right-to-left: query the count of ranks strictly below the current, then insert it. See [Fenwick tree](#fenwick-tree) and [coordinate compression](#coordinate-compression).

```python
def count_smaller_fenwick(nums):
    if not nums:
        return []
    rank = {v: i + 1 for i, v in enumerate(sorted(set(nums)))}   # 1-indexed
    tree = [0] * (len(rank) + 1)

    def update(i):
        while i < len(tree):
            tree[i] += 1
            i += i & -i

    def query(i):                       # prefix count [1..i]
        s = 0
        while i > 0:
            s += tree[i]; i -= i & -i
        return s

    res = [0] * len(nums)
    for i in range(len(nums) - 1, -1, -1):
        r = rank[nums[i]]
        res[i] = query(r - 1)           # strictly smaller
        update(r)
    return res
```

## Merge sort — counts during the merge

While merging, every time a right-half element is placed before left-half elements, those left elements each have one more smaller-to-the-right. Track `(value, original_index)` so counts land on the right positions. Guaranteed O(n log n). This is the same machinery as counting inversions in [merge sort](#mergesort).

## Choosing

- **bisect** — fastest to code; accept the O(n²) worst case.
- **Fenwick** — clean guaranteed O(n log n); extends to range/order-statistic queries.
- **merge sort** — no compression needed; the canonical "count inversions" answer.

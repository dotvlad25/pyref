---
id: fenwick-tree
title: Fenwick Tree (Binary Indexed Tree)
keywords: [fenwick tree, binary indexed tree, BIT, prefix sum, point update, range query, i & -i, lowbit, count inversions, log n update, cumulative frequency]
category: Algorithms
type: algo
related: [coordinate-compression, count-smaller-right, prefix-sum, bit-manipulation, heapq]
---
# Fenwick Tree (Binary Indexed Tree)

A Fenwick tree (BIT) maintains **prefix sums under point updates** in **O(log n)** each — beating a plain array (O(1) update / O(n) prefix query) or prefix-sum array (O(1) query / O(n) update). The trick is the low bit `i & -i`, which isolates the lowest set bit to hop between responsibility ranges.

```python
class BIT:
    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)     # 1-indexed

    def update(self, i, delta=1):     # add delta at position i
        while i <= self.n:
            self.tree[i] += delta
            i += i & (-i)             # move to the next range that covers i

    def query(self, i):               # prefix sum of [1..i]
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= i & (-i)             # strip the lowest set bit
        return s

    def range_query(self, lo, hi):    # sum of [lo..hi]
        return self.query(hi) - self.query(lo - 1)
```

## Why `i & -i`

In two's complement, `-i` flips all bits and adds 1, so `i & -i` yields the value of `i`'s lowest set bit (e.g. `12 (1100) & -12 → 4`). That value is exactly the length of the range each node is responsible for — adding it walks up during updates, subtracting it walks down during queries.

## Canonical use: counting

Feed values right-to-left (or left-to-right) and query before inserting to count how many earlier/later elements are smaller — the engine behind [count smaller to the right](#count-smaller-right) and inversion counting.

```python
def count_inversions(nums):
    # rank values to 1..k so they index the BIT (see coordinate-compression)
    rank = {v: i + 1 for i, v in enumerate(sorted(set(nums)))}
    bit = BIT(len(rank))
    inv = 0
    for x in reversed(nums):
        inv += bit.query(rank[x] - 1)   # values already seen that are smaller
        bit.update(rank[x])
    return inv
```

## Notes

- **1-indexed** — index 0 is unused; `query(0)` returns 0, which the loop relies on.
- Values must map to a compact `1..k` range — use [coordinate compression](#coordinate-compression) for arbitrary ints.
- Extends to range-update/point-query (store deltas) and 2-D grids. For plain immutable prefix sums with no updates, a [prefix-sum array](#prefix-sum) is simpler.

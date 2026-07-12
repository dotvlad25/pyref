---
id: permutations-combinations
title: permutations, combinations, product
keywords: [permutations, combinations, product, itertools, combinatorics, cartesian product, combinations_with_replacement, nested loops, r, choose, orderings, subsets]
category: Standard Library
type: reference
related: [itertools-overview, recursion-memoization, dfs, chain-islice]
---
# permutations, combinations, product

The combinatorial generators — the most-tested `itertools` functions. All are **lazy**; wrap in `list(...)` to see them.

```python
import itertools

# combinations — choose r items, order IRRELEVANT, no repeats
list(itertools.combinations([1, 2, 3, 4], 2))
# [(1,2),(1,3),(1,4),(2,3),(2,4),(3,4)]        # C(n, r) tuples

# permutations — all orderings (r defaults to len)
list(itertools.permutations([1, 2, 3]))
# [(1,2,3),(1,3,2),(2,1,3),(2,3,1),(3,1,2),(3,2,1)]   # n! tuples
list(itertools.permutations([1, 2, 3], 2))    # r=2: pick and order 2
```

## product — the nested-loop killer

`product` is the cartesian product. `repeat=n` = the same iterable n times.

```python
# product — cartesian product of nested loops
list(itertools.product([0, 1], repeat=3))
# all 3-bit numbers: [(0,0,0),(0,0,1),...,(1,1,1)]

# replaces this:
for a in [0, 1]:
    for b in [0, 1]:
        for c in [0, 1]:
            ...                # -> for a, b, c in product([0,1], repeat=3)

list(itertools.product("AB", [1, 2]))   # [('A',1),('A',2),('B',1),('B',2)]
```

## with replacement

```python
list(itertools.combinations_with_replacement([1, 2, 3], 2))
# [(1,1),(1,2),(1,3),(2,2),(2,3),(3,3)]   # allows repeats
```

## Gotchas

```python
# Output order follows INPUT order, not sorted order.
# Elements are treated as unique by POSITION, not value:
list(itertools.combinations([1, 1, 2], 2))   # [(1,1),(1,2),(1,2)] — dups!
```

Counts explode: permutations are **O(n!)**, product is **O(k^n)**. Fine for small n; for pruned search write explicit [backtracking / DFS](#dfs). See also [LeetCode #46 / #77 / #39].

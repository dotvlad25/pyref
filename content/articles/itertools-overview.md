---
id: itertools-overview
title: itertools Overview
keywords: [itertools, lazy iterators, generators, iterator building blocks, combinatorics, infinite iterators, memory efficient, standard library, iterator recipes]
category: Standard Library
type: reference
related: [permutations-combinations, accumulate, groupby, chain-islice, count-cycle-repeat, starmap-compress]
---
# itertools Overview

`itertools` provides **lazy** iterator building blocks — nothing is computed until you consume it, so you iterate huge (or infinite) sequences with **O(1) memory**. Reach for it to replace nested loops and hand-rolled generators.

```python
import itertools
```

Pick the tool by intent:

```python
# --- Combinatorics (finite) ---
itertools.combinations(it, r)    # choose r, order irrelevant
itertools.permutations(it, r)    # orderings of r
itertools.product(it, repeat=n)  # cartesian product = nested loops

# --- Sequence transforms (lazy) ---
itertools.accumulate(it, func)   # running totals / prefix scan
itertools.groupby(it, key)       # group CONSECUTIVE equal keys (sort first!)
itertools.chain(a, b, c)         # concatenate iterables, zero copy
itertools.islice(it, stop)       # slice an iterator (no indexing needed)
itertools.starmap(func, tuples)  # func(*args) over pre-zipped tuples
itertools.compress(data, mask)   # keep items where mask is truthy

# --- Infinite (pair with zip / islice / takewhile) ---
itertools.count(start, step)     # 0,1,2,... forever
itertools.cycle(it)              # repeat sequence forever
itertools.repeat(x, n)           # x, x, x ... (n times or forever)
```

Everything returns a **one-shot iterator** — consuming it exhausts it:

```python
it = itertools.chain([1, 2], [3])
list(it)   # [1, 2, 3]
list(it)   # [] — already exhausted; use itertools.tee to duplicate
```

Use `list(...)` to materialize when you need to iterate twice or index. Details: [combinatorics](#permutations-combinations), [accumulate](#accumulate), [groupby](#groupby), [chain/islice/tee](#chain-islice), [count/cycle/repeat](#count-cycle-repeat), [starmap/compress](#starmap-compress).

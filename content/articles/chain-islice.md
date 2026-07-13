---
id: chain-islice
title: chain, islice, tee
keywords: [chain, islice, tee, itertools, flatten, concatenate, slice iterator, duplicate iterator, from_iterable, chain.from_iterable, lazy slice, generator slicing]
category: Standard Library
type: reference
related: [itertools-overview, count-cycle-repeat, accumulate, deque]
---
# chain, islice, tee

Three iterator plumbing tools: **concatenate**, **slice**, and **duplicate** — all lazy. `chain`/`islice` are **O(1)** memory; `tee` buffers (see gotcha).

## chain — flatten / concatenate

```python
import itertools

# chain — iterate multiple iterables as one, zero copy
a, b, c = [1, 2], [3, 4], [5, 6]
list(itertools.chain(a, b, c))          # [1, 2, 3, 4, 5, 6]

for x in itertools.chain(a, b, c):      # no intermediate list built
    ...

# chain.from_iterable — flatten ONE level of a nested iterable
nested = [[1, 2], [3, 4], [5, 6]]
list(itertools.chain.from_iterable(nested))   # [1, 2, 3, 4, 5, 6]
```

## islice — slice any iterator

Slicing without loading everything; works on generators/infinite iterators where `it[a:b]` is impossible. Note: **no negative indices**.

```python
itertools.islice(it, stop)              # first `stop` items
itertools.islice(it, start, stop)       # [start, stop)
itertools.islice(it, start, stop, step) # with step

list(itertools.islice(range(100), 5))        # [0,1,2,3,4]
list(itertools.islice(range(100), 2, 8, 2))  # [2,4,6]

# tame an infinite iterator:
list(itertools.islice(itertools.count(10), 3))   # [10, 11, 12]
```

## tee — duplicate an iterator

Splits one iterator into `n` independent ones. Use when you must pass over the same lazy stream twice.

```python
it = iter([1, 2, 3, 4])
x, y = itertools.tee(it, 2)
list(x)     # [1, 2, 3, 4]
list(y)     # [1, 2, 3, 4]  — independent copy
```

```python
# GOTCHA: tee buffers items consumed by the fastest branch. If one copy
# races far ahead, memory grows. And do NOT use the original `it` after
# tee-ing it — advancing it corrupts the tee copies. Often a list() is
# simpler when the data is small.
```

Pair `islice` with [count/cycle/repeat](#count-cycle-repeat) to bound infinite iterators; see the [itertools overview](#itertools-overview).

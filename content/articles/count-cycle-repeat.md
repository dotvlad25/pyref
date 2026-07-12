---
id: count-cycle-repeat
title: count, cycle, repeat
keywords: [count, cycle, repeat, itertools, infinite iterators, enumerate replacement, zip, round robin, constant iterator, takewhile, islice, auto increment id]
category: Standard Library
type: reference
related: [itertools-overview, chain-islice, starmap-compress]
---
# count, cycle, repeat

The three **infinite** iterators. On their own they never stop — always bound them with `zip`, [`islice`](#chain-islice), or `takewhile`.

## count — endless counter

```python
import itertools

itertools.count()          # 0, 1, 2, 3, ...
itertools.count(10)        # 10, 11, 12, ...
itertools.count(0, 2)      # 0, 2, 4, ...  (start, step)
itertools.count(1.0, 0.5)  # floats work too
```

Best used with `zip` to attach an index to a lazy/infinite stream (an `enumerate` you control):

```python
for i, val in zip(itertools.count(1), stream):   # 1-based index, no len()
    ...
```

## cycle — repeat a sequence forever

```python
colors = itertools.cycle(["R", "G", "B"])
[next(colors) for _ in range(5)]     # ['R','G','B','R','G']

# Round-robin assign items to N buckets:
for item, bucket in zip(items, itertools.cycle(range(N))):
    ...
# NOTE: cycle caches the input, so it stays in memory for the whole run.
```

## repeat — same value, n times (or forever)

```python
list(itertools.repeat(7, 3))         # [7, 7, 7]   — bounded with count arg
itertools.repeat(7)                  # 7, 7, 7, ... forever
```

Two classic uses:

```python
# Supply a constant argument to a parallel map/zip:
list(map(pow, [2, 3, 4], itertools.repeat(2)))   # [4, 9, 16] — squares

# Fast fixed-count loop (slightly faster than range for pure repetition):
for _ in itertools.repeat(None, 1000):
    ...
```

## Bounding infinite iterators

```python
list(itertools.islice(itertools.count(), 5))                 # [0,1,2,3,4]
list(itertools.takewhile(lambda x: x < 20, itertools.count(0, 5)))  # [0,5,10,15]
```

Pair these with [zip](#count-cycle-repeat) and [starmap](#starmap-compress) for compact data pipelines.

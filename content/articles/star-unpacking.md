---
id: star-unpacking
title: Star Unpacking (* and **)
keywords: [star unpacking, splat, first rest, unpack, spread, args, kwargs, merge lists, merge dicts, zip star, transpose, variadic, argument spreading]
category: Language
type: reference
related: [unpacking, enumerate-zip, comprehensions]
---
# Star Unpacking (* and **)

`*` captures/spreads sequences, `**` does the same for dicts. Reach for it to grab a remainder, merge, or spread args.

## Capture a remainder

```python
first, *rest = [1, 2, 3, 4, 5]   # first=1, rest=[2, 3, 4, 5]
*init, last = [1, 2, 3, 4, 5]    # init=[1,2,3,4], last=5
a, *mid, b = [1, 2, 3, 4, 5]     # a=1, mid=[2,3], b=5
# The starred name always becomes a list (possibly empty).
```

## Spread into a function call

```python
def add(a, b, c):
    return a + b + c

args = [1, 2, 3]
add(*args)              # same as add(1, 2, 3) -> 6

kwargs = {"a": 1, "b": 2, "c": 3}
add(**kwargs)           # spread dict as keyword args
```

## Collect args in a definition

```python
def show(*args, **kwargs):   # args=tuple, kwargs=dict
    ...
```

## Merge lists / dicts

```python
merged = [*a, *b, 99]              # concatenate lists
combo  = {**d1, **d2}             # later keys win on conflict
```

## Transpose a matrix with `zip(*)`

```python
matrix = [[1, 2, 3], [4, 5, 6]]
list(zip(*matrix))       # [(1, 4), (2, 5), (3, 6)]
# *matrix -> zip([1,2,3],[4,5,6]); zip pairs the i-th of each row.
```

See [enumerate & zip](#enumerate-zip) and basic [unpacking](#unpacking).

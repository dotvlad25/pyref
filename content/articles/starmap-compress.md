---
id: starmap-compress
title: starmap, compress, filterfalse
keywords: [starmap, compress, filterfalse, itertools, map unpack, apply over tuples, boolean mask, inverse filter, filter false, splat, star args, dropwhile, takewhile]
category: Standard Library
related: [itertools-overview, count-cycle-repeat, chain-islice]
---
# starmap, compress, filterfalse

Three lazy transforms for applying, masking, and inverse-filtering. All return iterators — wrap in `list(...)` to see results.

## starmap — map that unpacks tuples

`map(f, it)` calls `f(x)`. `starmap(f, it)` calls `f(*args)` — use it when the iterable holds **pre-zipped tuples of arguments**.

```python
import itertools

pairs = [(2, 3), (4, 5), (10, 2)]
list(itertools.starmap(pow, pairs))          # [8, 1024, 100]  -> pow(2,3)...

# equivalent to:  [pow(a, b) for a, b in pairs]
# pairs naturally from zip():
list(itertools.starmap(lambda a, b: a + b, zip([1,2,3], [10,20,30])))  # [11,22,33]
```

## compress — keep items where the mask is truthy

Selects `data[i]` wherever `selectors[i]` is true. Stops at the shorter of the two.

```python
data      = ["a", "b", "c", "d", "e"]
mask      = [1,   0,   1,   0,   1]
list(itertools.compress(data, mask))         # ['a', 'c', 'e']

# Mask can be any booleans — great for filtering by a parallel condition:
nums = [5, -2, 7, -1, 3]
list(itertools.compress(nums, (n > 0 for n in nums)))   # [5, 7, 3]
```

## filterfalse — the inverse of filter

`filter` keeps truthy; `filterfalse` keeps the ones that FAIL the predicate.

```python
nums = [0, 1, 2, 3, 4, 5]
list(filter(lambda x: x % 2, nums))                 # [1,3,5]  odds (builtin)
list(itertools.filterfalse(lambda x: x % 2, nums))  # [0,2,4]  evens

# predicate=None -> keep the falsy items:
list(itertools.filterfalse(None, [0, 1, "", "x", None, 5]))   # [0, '', None]
```

## Related lazy filters

```python
list(itertools.takewhile(lambda x: x < 3, [1,2,3,1]))   # [1,2] stop at first false
list(itertools.dropwhile(lambda x: x < 3, [1,2,3,1]))   # [3,1] drop leading true
```

See [count/cycle/repeat](#count-cycle-repeat) to build the argument streams and the [itertools overview](#itertools-overview) for the full map.

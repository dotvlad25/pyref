---
id: next-builtin
title: "The next() Builtin and First-Match Idiom"
keywords: [next, next builtin, advance iterator, stopiteration, default argument, first match, first element, generator expression, iterator, one-pass, sentinel default]
category: Language
type: reference
related: [iterables, generator-expressions, min-max-any-all, enumerate-zip]
---
# The next() Builtin and First-Match Idiom

`next(it)` pulls one value from an iterator/generator, advancing its state. When exhausted it raises `StopIteration` — pass a **default** as the second argument to get a safe fallback instead.

```python
multiples = (3 * i for i in range(4))   # generator: 0,3,6,9
next(multiples)         # 0
next(multiples)         # 3
next(multiples)         # 6
next(multiples)         # 9
next(multiples)         # raises StopIteration
next(multiples, None)   # None  (default suppresses the exception)
```

Only iterators support `next()`. Wrap a plain iterable in `iter()` first:

```python
nums = [10, 20, 30]
# next(nums)          # TypeError: list is not an iterator
it = iter(nums)
next(it)               # 10
```

## First-match idiom

`next((expr for x in iterable if cond), default)` returns the **first** element matching a predicate — short-circuits, so it stops at the first hit (O(k), not O(n)).

```python
nums = [1, 3, 5, 8, 9]

# First even number, or None if there is none
first_even = next((x for x in nums if x % 2 == 0), None)   # 8

# First index matching a condition
idx = next((i for i, x in enumerate(nums) if x > 4), -1)   # 2

# GOTCHA: without a default, no match raises StopIteration
next(x for x in nums if x > 100)   # StopIteration!
```

Compare with [min-max-any-all](#min-max-any-all): use `next(...)` when you want the actual first element; use `any(...)` when you only need a bool.

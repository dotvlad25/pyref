---
id: min-max-any-all
title: min, max, any, all
keywords: [min, max, any, all, key argument, default, short circuit, reduce, count with sum, argmax, empty iterable, power builtins]
category: Standard Library
type: reference
related: [sorting-key, generator-expressions, comprehensions, heapq]
---
# min, max, any, all

Four built-ins that eat any iterable. All are O(n); `any`/`all` short-circuit.

## min / max with `key=`

```python
words = ["apple", "fig", "banana", "kiwi"]
min(words, key=len)     # 'fig'
max(words, key=len)     # 'banana'

points = [(1, 3), (2, 1), (4, 2)]
min(points, key=lambda p: p[1])   # (2, 1)  by second field
```

Same `key=` idea as [sorting](#sorting-key). For k extremes, use a [heap](#heapq).

## default= — avoid errors on empty

```python
max([], default=0)      # 0   (no ValueError)
min((x for x in nums if x > 100), default=None)
```

## any / all — short-circuit booleans

```python
nums = [0, 0, 3, 0]
any(nums)                    # True  (>=1 truthy)
any(x > 2 for x in nums)     # True  (stops at first match: 3)
all(x > 0 for x in [1, 0, 3])  # False (stops at first 0)
all([])                      # True  (vacuous)
any([])                      # False
```

## Counting with sum + a genexp

```python
sum(1 for x in nums if x > 0)   # count positives
sum(x > 0 for x in nums)         # same: bool is 0/1
```

## Gotchas

```python
max("apple", "banana")   # compares STRINGS lexicographically -> 'banana'
max(nums)                # ValueError on empty -> pass default=
```

Feed these [generator expressions](#generator-expressions), not lists, for O(1) memory.

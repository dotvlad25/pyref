---
id: nested-functions
title: Nested Functions
keywords: [nested function, inner function, helper function, factory function, closure, recursion helper, def inside def]
category: Language
type: concept
related: [closures, lambda, global-nonlocal, recursion-memoization, dfs]
---
# Nested Functions

A function defined *inside* another. Reach for one when the logic needs more than one line, a conditional, or access to data computed in the outer scope — the natural step up from a [lambda](#lambda).

```python
def outer(x):
    def inner(y):
        return x + y     # inner reads x via closure — no need to pass it
    return inner

add5 = outer(5)
add5(3)                  # 8
```

## Use 1: sort key that needs precomputed data

A `lambda` can capture a local like `freq` too, but a nested `def` gives the key a name and room to grow beyond a single expression (a statement, a branch).

```python
from collections import Counter

def sort_by_frequency(nums):
    freq = Counter(nums)
    def sort_key(x):
        return (-freq[x], x)          # desc frequency, then asc value
    return sorted(nums, key=sort_key)

sort_by_frequency([4, 1, 1, 2, 4, 4, 2])   # [4, 4, 4, 1, 1, 2, 2]
```

## Use 2: recursion helper (clean public interface)

Defining the recursive worker inside keeps the caller-facing API to one function.

```python
def max_depth(root):
    def dfs(node):
        if not node:
            return 0
        return 1 + max(dfs(node.left), dfs(node.right))
    return dfs(root)
```

## Use 3: factory function (returns a configured function)

```python
def multiplier(n):
    def mul(x):
        return x * n     # n is captured — see closures
    return mul

triple = multiplier(3)
triple(10)               # 30
```

The captured-variable mechanics (and the write-access rule via `nonlocal`) live in [closures](#closures) and [global & nonlocal](#global-nonlocal).

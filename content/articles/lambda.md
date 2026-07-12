---
id: lambda
title: Lambda Functions
keywords: [lambda, anonymous function, inline function, key, sorted, map, filter, reduce, min, max, throwaway]
category: Language
type: reference
related: [nested-functions, closures, sorting-key, functools-cache]
---
# Lambda Functions

A **lambda** is a one-line anonymous function: `lambda args: expression`. Exactly equivalent to a `def` that returns the expression, just inline. Reach for it when passing a tiny function as an argument.

```python
square = lambda x: x * x        # same as: def square(x): return x * x
add = lambda a, b: a + b
add(3, 4)                       # 7
```

## Real use: pass directly as key=

You almost never name a lambda — inline it as `key=`.

```python
intervals = [[3, 6], [1, 4], [2, 5]]
sorted(intervals, key=lambda x: x[0])          # sort by start -> [[1,4],[2,5],[3,6]]

words = ["banana", "fig", "apple", "kiwi"]
sorted(words, key=lambda w: (len(w), w))       # length, then alphabetical

points = [(3, 4), (1, 1), (2, 3)]
min(points, key=lambda p: p[0]**2 + p[1]**2)   # (1, 1) closest to origin
```

Also common with `map`/`filter` (though comprehensions are usually clearer):

```python
list(map(lambda x: x * 2, [1, 2, 3]))          # [2, 4, 6]
list(filter(lambda x: x % 2 == 0, range(6)))   # [0, 2, 4]
```

## Limits & gotchas

```python
# Body must be a SINGLE expression — no statements, assignments, or multi-line logic.
# lambda x: x += 1        # SyntaxError
# lambda x: print(x); ... # can't chain statements

key=lambda w: w.lower     # BUG: passes the method, not its result
key=lambda w: w.lower()   # call it!
```

When the key needs more than one expression or precomputed data (like a frequency map), use a [nested function](#nested-functions) instead. See [sorting-key](#sorting-key) for the full sort toolkit.

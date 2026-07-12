---
id: comprehensions
title: List/Dict/Set Comprehensions
keywords: [comprehension, list comprehension, dict comprehension, set comprehension, filtering, nested comprehension, conditional expression, ternary, flatten, map filter]
category: Language
type: reference
related: [generator-expressions, enumerate-zip, ternary-expression, dict, set]
---
# List/Dict/Set Comprehensions

Replace verbose build-a-list loops with one dense, readable (and slightly faster) expression.

## List — map & filter

```python
squares = [x**2 for x in range(10)]
evens   = [x for x in range(20) if x % 2 == 0]     # trailing if = filter
```

## Conditional expression (ternary) in the value slot

```python
labels = ["even" if x % 2 == 0 else "odd" for x in range(6)]
# 'if/else' BEFORE the loop transforms the value;
# 'if' AFTER the loop filters. Different jobs.
```

## Dict & set

```python
words = ["apple", "fig", "banana"]
word_lengths  = {w: len(w) for w in words}   # {'apple': 5, ...}
unique_lengths = {len(w) for w in words}       # {3, 5, 6}
```

## Nested — flatten a matrix

```python
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [val for row in matrix for val in row]   # 1..9
# Loops read left-to-right = OUTER first, then inner:
#   for row in matrix:
#       for val in row: ...
```

## Build a grid

```python
grid = [[0] * cols for _ in range(rows)]
# Use a comprehension, NOT [[0]*cols]*rows — that aliases one row!
```

Only iterating once and passing to `sum`/`min`/`max`? Use a [generator expression](#generator-expressions) for O(1) memory.

---
id: generator-expressions
title: Generator Expressions
keywords: [generator expression, lazy evaluation, genexp, next, memory, sum gen, iterator, exhausted, one pass, stopiteration, streaming]
category: Language
related: [comprehensions, min-max-any-all, walrus-operator]
---
# Generator Expressions

Looks like a list comprehension but uses `()` — produces values lazily, one at a time, at O(1) memory.

```python
squares_list = [x**2 for x in range(1_000_000)]  # builds full list (~8 MB)
squares_gen  = (x**2 for x in range(1_000_000))  # O(1) memory, nothing built yet
```

## Pass straight to a reducing function

```python
total = sum(x**2 for x in range(1_000_000))   # no list needed
# Works with sum/min/max/any/all — they only iterate once.
# When it's the sole arg you can drop the extra parens.
```

## next() — pull one value

```python
nums = [4, 7, 2, 9, 1]
first_even = next((x for x in nums if x % 2 == 0), None)  # 4
# 2nd arg is the default -> avoids StopIteration when exhausted.
```

## Gotcha — single pass, then dead

```python
gen = (x for x in range(3))
list(gen)   # [0, 1, 2]
list(gen)   # []  <- exhausted, no reset. Wrap in a function for reuse.
```

## When to use which

```python
# list comp  -> need indexing, multiple passes, or a real list
# genexp     -> iterate once, especially inside sum/min/max/any/all
```

See [comprehensions](#comprehensions) and [min, max, any, all](#min-max-any-all).

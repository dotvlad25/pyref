---
id: iterables
title: "Iterables: the Iterable Protocol"
keywords: [iterable, iterator, iter, next, "__iter__", "__next__", for loop, protocol, generator, generator expression, lazy, sum, min, max, sorted, list, any iterable, sequence]
category: Language
type: concept
related: [loops, generator-expressions, next-builtin, enumerate-zip, comprehensions, sorted-vs-sort, min-max-any-all]
---
# Iterables: the Iterable Protocol

An **iterable** is any object you can step through with a `for` loop: lists, tuples, strings, dicts (keys), sets, `range`, files, and generators — no extra ceremony.

```python
for ch in "hi":            print(ch)   # strings are iterable
for k  in {"a": 1}:        print(k)    # dict yields keys
for v  in {10, 20}:        print(v)    # set (unordered)
for i  in range(3):        print(i)    # range is lazy, iterable
```

The payoff: built-ins accept **any** iterable, not just lists.

```python
sorted("hello")            # ['e','h','l','l','o'] — string -> sorted list
sorted({3, 1, 2})          # [1, 2, 3]            — set  -> sorted list
sorted({"b": 2, "a": 1})   # ['a', 'b']           — dict keys sorted
sum(range(101))            # 5050                 — no list built
list(range(3))             # [0, 1, 2]            — materialize
```

**Generator expressions** are lazy iterables: `()` instead of `[]`, produce one value at a time, no full list in memory. Pass them directly to `sum`/`min`/`max` — no extra `[]` needed.

```python
total    = sum(x*x for x in range(1_000_000))   # O(1) extra space
min_even = min(x for x in nums if x % 2 == 0)   # filtered aggregate
```

Under the hood (the protocol): an iterable implements `__iter__()` returning an **iterator**, which implements `__next__()` and raises `StopIteration` when exhausted. `for` calls these for you. See [next()](#next-builtin).

```python
it = iter([1, 2])          # get an iterator
next(it)                   # 1
next(it)                   # 2
next(it, "done")           # 'done' — default avoids StopIteration

# Custom iterable: define __iter__ (often as a generator)
class Countdown:
    def __init__(self, n): self.n = n
    def __iter__(self):
        n = self.n          # local, not self.n -> re-iterable
        while n > 0:
            yield n         # generator = iterator for free
            n -= 1
```

Gotcha: an iterator/generator is **single-pass** — once exhausted, re-looping yields nothing. Rebuild it or use a list for multiple passes.

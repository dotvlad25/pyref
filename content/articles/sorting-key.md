---
id: sorting-key
title: Sorting with key & Custom Comparators
keywords: [sort, sorted, key, lambda, reverse, multi key, cmp_to_key, itemgetter, attrgetter, stable sort, negation trick]
category: Standard Library
type: reference
related: [heap-tuples, bisect, two-pointers]
---
# Sorting with key & Custom Comparators

`sorted()` returns a new list; `list.sort()` sorts in place. Both are **O(N log N)** and **stable** (equal elements keep their input order).

```python
sorted(nums)                     # ascending, new list
sorted(nums, reverse=True)       # descending
nums.sort()                      # in place, returns None
```

## key= — sort by a derived value

```python
sorted(words, key=len)                       # by length
sorted(people, key=lambda p: p.age)          # by attribute
sorted(pairs, key=lambda x: x[1])            # by 2nd element
```

`key` is called once per element (fast). Prefer it over `cmp_to_key`.

## Multi-key sort

```python
# Sort by priority ascending, then name ascending
sorted(items, key=lambda x: (x.priority, x.name))
```

Because sort is stable, you can also sort in passes (least significant first).

## The negation trick — mixed directions

```python
# age ascending, but name DESCENDING within same age? Negate what you can:
sorted(people, key=lambda p: (p.age, ))                 # numeric: negate -> -p.age
# For strings you can't negate; sort in two stable passes instead:
people.sort(key=lambda p: p.name, reverse=True)
people.sort(key=lambda p: p.age)                        # final key wins as primary
```

## operator helpers (faster, cleaner)

```python
from operator import itemgetter, attrgetter
sorted(pairs, key=itemgetter(1))
sorted(people, key=attrgetter("age", "name"))
```

## cmp_to_key — when comparison is inherently pairwise

```python
from functools import cmp_to_key
def cmp(a, b):
    return (a > b) - (a < b)      # -1 / 0 / 1
sorted(nums, key=cmp_to_key(cmp))
```

Only reach for `cmp_to_key` when the order can't be expressed as a key (e.g. "largest number" concatenation problems).

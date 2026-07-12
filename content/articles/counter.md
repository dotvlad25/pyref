---
id: counter
title: collections.Counter
keywords: [counter, collections, frequency, count, most_common, elements, multiset, tally, anagram]
category: Data Structures
type: reference
related: [dict, defaultdict, top-k]
---
# collections.Counter

A `dict` subclass for counting hashable items. Building one is **O(N)**.

```python
from collections import Counter

c = Counter("banana")            # Counter({'a': 3, 'n': 2, 'b': 1})
c = Counter([1, 1, 2, 3])        # from any iterable
c = Counter(a=2, b=1)            # from kwargs

c["a"]          # 3
c["z"]          # 0 (missing keys return 0, they are NOT inserted)
```

## most_common

```python
c.most_common(2)     # [('a', 3), ('n', 2)]  — top 2 by count
c.most_common()      # all, sorted by count descending
```

`most_common(k)` is **O(U log k)** where U = number of unique elements (uses a heap).

## Arithmetic on counters (multisets)

```python
a = Counter("aab")
b = Counter("abc")
a + b     # add counts:        Counter({'a': 3, 'b': 2, 'c': 1})
a - b     # subtract, drop ≤0: Counter({'a': 1})
a & b     # intersection (min): Counter({'a': 1, 'b': 1})
a | b     # union (max):        Counter({'a': 2, 'b': 1, 'c': 1})
```

## Anagram check (classic use)

```python
def is_anagram(s, t):
    return Counter(s) == Counter(t)
```

## elements()

```python
list(Counter(a=2, b=1).elements())   # ['a', 'a', 'b'] — expands back out
```

---
id: groupby
title: itertools.groupby
keywords: [groupby, itertools, group consecutive, consecutive grouping, sort first, key function, run length encoding, adjacent, grouping, split runs]
category: Standard Library
related: [grouping, itertools-overview, sorting-key, defaultdict, counter]
---
# itertools.groupby

`itertools.groupby` groups **consecutive** elements sharing a key. The one thing to remember: it only sees adjacent items, so **sort by the same key first** or you get split groups.

```python
import itertools

data = [("a",1), ("a",2), ("b",3), ("b",4), ("a",5)]
for key, group in itertools.groupby(data, key=lambda x: x[0]):
    print(key, list(group))
# a [('a',1),('a',2)]
# b [('b',3),('b',4)]
# a [('a',5)]      <-- SPLIT! the trailing "a" is a separate group
```

## The #1 bug: sort before groupby

```python
data.sort(key=lambda x: x[0])          # same key as groupby
for key, group in itertools.groupby(data, key=lambda x: x[0]):
    print(key, list(group))
# a [('a',1),('a',2),('a',5)]          # now correct — one "a" group
```

Why: `groupby` starts a new group whenever the key changes between neighbors. Unsorted data has the same key in non-adjacent spots → multiple groups. (See [sorting-key](#sorting-key).)

## Gotchas

```python
# The group is a LAZY sub-iterator tied to the parent — consume it
# (e.g. list(group)) BEFORE advancing, or it gets skipped:
groups = itertools.groupby(sorted("aabbbc"))
saved = [(k, list(g)) for k, g in groups]   # materialize immediately
# [('a',['a','a']), ('b',['b','b','b']), ('c',['c'])]
```

## Handy patterns

```python
# Count per group (run-length encoding)
[(k, sum(1 for _ in g)) for k, g in itertools.groupby("aabbbc")]
# [('a',2),('b',3),('c',1)]

# Group into a dict of lists
from collections import defaultdict
out = defaultdict(list)
for k, g in itertools.groupby(sorted(data, key=lambda x: x[0]), key=lambda x: x[0]):
    out[k].extend(g)
```

Need grouping without pre-sorting? A [defaultdict(list)](#defaultdict) in a single pass is often simpler and **O(n)**.

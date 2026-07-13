---
id: collections-overview
title: collections Module Overview
keywords: [collections, deque, counter, defaultdict, namedtuple, ordereddict, chainmap, standard library, specialized containers, data structures map]
category: Standard Library
type: reference
related: [deque, counter, defaultdict, ordereddict, chainmap, dict, heapq, complexity-cheatsheet]
---
# collections Module Overview

Specialized container types that replace hand-rolled code. Pick by intent.

```python
from collections import (
    deque, Counter, defaultdict, namedtuple, OrderedDict, ChainMap
)
```

```python
# deque — O(1) push/pop at BOTH ends. Use as queue (BFS) or sliding window.
dq = deque([1, 2]); dq.appendleft(0); dq.popleft()   # list.pop(0) is O(n)!

# Counter — frequency map / multiset. Building is O(n).
Counter("banana")            # {'a':3,'n':2,'b':1}
Counter("banana").most_common(2)   # [('a',3),('n',2)]

# defaultdict — auto-create missing values, no KeyError.
g = defaultdict(list); g[0].append(1)     # {0:[1]}
freq = defaultdict(int); freq[c] += 1     # counting

# namedtuple — lightweight immutable record with named fields.
Point = namedtuple("Point", "x y")
p = Point(1, 2); p.x, p.y                  # 1 2 ; also p[0], tuple-unpackable

# OrderedDict — O(1) move_to_end + popitem(last=False) => LRU cache.
od = OrderedDict(); od.move_to_end(k); od.popitem(last=False)

# ChainMap — layered lookup over multiple dicts (config / scopes).
ChainMap(overrides, defaults)["key"]       # first map wins
```

## Which one?

```python
# "queue / both-ends"          -> deque      (#deque)
# "count / frequency / anagram"-> Counter    (#counter)
# "group / accumulate by key"  -> defaultdict(#defaultdict)
# "named fields, immutable"    -> namedtuple
# "LRU / reorder / pop front"  -> OrderedDict(#ordereddict)
# "layered defaults / scopes"  -> ChainMap   (#chainmap)
```

Since Python 3.7 plain `dict` keeps insertion order, so reach for [OrderedDict](#ordereddict) only when you need `move_to_end`/`popitem(last=False)`. For counting, [Counter](#counter) and `defaultdict(int)` both work; Counter adds `most_common` and multiset arithmetic.

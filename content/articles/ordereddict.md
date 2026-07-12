---
id: ordereddict
title: OrderedDict
keywords: [ordereddict, collections, move_to_end, popitem, insertion order, lru, ordered dictionary]
category: Data Structures
related: [lru-cache, dict, defaultdict, counter]
---
# OrderedDict

`collections.OrderedDict` remembers insertion order and adds order-manipulation methods. Since Python 3.7 the built-in `dict` also preserves insertion order, but `OrderedDict` still wins when you need `move_to_end` or order-sensitive equality.

```python
from collections import OrderedDict

d = OrderedDict()
d["a"] = 1
d["b"] = 2
d["c"] = 3

# Move an existing key to the right end (most recently used)
d.move_to_end("a")            # order: b, c, a
d.move_to_end("c", last=False)  # move to the LEFT end -> order: c, b, a

# Pop from either end — O(1)
d.popitem(last=True)          # remove & return rightmost (last inserted)
d.popitem(last=False)         # remove & return leftmost (first inserted)
```

All key ops (`get`/`set`/`del`/`move_to_end`/`popitem`) are **O(1)**.

## Why it matters for LRU

`move_to_end` + `popitem(last=False)` is exactly the primitive an [LRU cache](#) needs — recency tracking with O(1) eviction of the oldest entry.

## Order-sensitive equality

```python
OrderedDict([("a", 1), ("b", 2)]) == OrderedDict([("b", 2), ("a", 1)])  # False
dict([("a", 1), ("b", 2)])        == dict([("b", 2), ("a", 1)])         # True
```

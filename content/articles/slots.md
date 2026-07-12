---
id: slots
title: __slots__
keywords: [__slots__, slots, memory, __dict__, attribute, optimization, restriction, fixed attributes, performance, footprint]
category: OOP
type: reference
related: [classes, dataclasses, magic-methods, namedtuple]
---
# __slots__

Reach for `__slots__` when you create **millions** of small objects (graph nodes, tree nodes) and want to cut memory. It replaces each instance's per-object `__dict__` with a fixed, array-like layout.

```python
class Node:
    __slots__ = ("val", "next")     # only these attributes allowed
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

n = Node(1)
n.val = 5           # fine — declared in __slots__
# n.color = "red"   → AttributeError: no __dict__, attribute not in slots
```

## Why it saves memory

```python
# Normal instance: each object carries a __dict__ (hash table) → ~heavy
# __slots__: fixed slots, no per-instance dict → often 30-50% smaller
#            and slightly faster attribute access.

class Plain:  pass
class Slim:   __slots__ = ("x",)

Plain().__dict__        # {}  — the overhead
# Slim().__dict__       → AttributeError: no __dict__
hasattr(Slim(), "__dict__")   # False
```

## Restrictions & gotchas

```python
# 1. Can't add attributes not listed in __slots__ (that's the point).
# 2. No __dict__ / __weakref__ unless you add them explicitly.
# 3. Inheritance: a subclass WITHOUT its own __slots__ regains a __dict__,
#    silently losing the savings. Declare __slots__ = () in the subclass.
# 4. Can't combine a slot name with a class-level default of the same name.
```

## With dataclasses (Python 3.10+)

```python
from dataclasses import dataclass

@dataclass(slots=True)      # generates __slots__ for you
class Point:
    x: int
    y: int
```

Only optimize when profiling shows object count is the bottleneck; for ordinary code the memory win isn't worth the loss of flexibility. Combine with [`@dataclass`](#dataclasses) for slotted records.

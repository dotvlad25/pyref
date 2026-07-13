---
id: comparable-objects
title: Comparable & Hashable Objects
keywords: [comparable, hashable, __eq__, __hash__, __lt__, total_ordering, functools, hash contract, sortable, set element, dict key, heap, immutable]
category: OOP
type: concept
related: [magic-methods, dataclasses, classes, heap-tuples, sorting-key, set]
---
# Comparable & Hashable Objects

To put custom objects in a `set`/`dict` or sort them, implement the right dunders — and honor the contracts.

## The __eq__ / __hash__ contract

```python
class Point:
    def __init__(self, x, y): self.x, self.y = x, y
    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented          # unlike types → let Python fall back (avoids AttributeError)
        return (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))     # equal objects → equal hashes
```

Rules: **if `a == b` then `hash(a) == hash(b)`**. Hash only on immutable fields — mutating a field used in `__hash__` after inserting into a set corrupts the set.

```python
# GOTCHA: defining __eq__ alone sets __hash__ = None → object unhashable
class Bad:
    def __eq__(self, o): return True
# {Bad()}  → TypeError: unhashable type. Always add __hash__ too.
```

## total_ordering — full comparisons from two methods

```python
from functools import total_ordering

@total_ordering
class Ver:
    def __init__(self, major, minor):
        self.major, self.minor = major, minor
    def __eq__(self, o):
        return (self.major, self.minor) == (o.major, o.minor)
    def __lt__(self, o):
        return (self.major, self.minor) < (o.major, o.minor)
    # total_ordering fills in <=, >, >= from __lt__ (!= comes free from default __ne__)

sorted([Ver(2, 0), Ver(1, 5)])       # works
Ver(1, 5) >= Ver(1, 0)               # True — generated
```

## Shortcuts

```python
from dataclasses import dataclass

@dataclass(frozen=True, order=True)   # __eq__, __hash__, AND all comparisons
class Point:
    x: int
    y: int
{Point(0, 0)}                         # hashable
sorted([Point(2, 1), Point(1, 9)])    # ordered (field-wise, like a tuple)
```

For [heaps](#heap-tuples), objects need `__lt__` (or wrap in a `(priority, obj)` tuple). `@dataclass(frozen=True, order=True)` is the fastest correct path to a sortable, hashable value type.

---
id: dataclasses
title: dataclasses
keywords: [dataclass, dataclasses, field, frozen, order, default_factory, __init__ generated, __repr__, __eq__, boilerplate, record, asdict]
category: OOP
related: [classes, namedtuple, magic-methods, comparable-objects, type-hints, slots]
---
# dataclasses

Reach for `@dataclass` to auto-generate `__init__`, `__repr__`, and `__eq__` from annotated fields — no boilerplate. Python 3.7+.

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int = 0            # default value

p = Point(3, 4)
p                        # Point(x=3, y=4)   ← free __repr__
Point(3, 4) == Point(3, 4)   # True          ← free __eq__ (field-wise)
```

## Mutable defaults need `field(default_factory=...)`

```python
from dataclasses import dataclass, field

@dataclass
class Bag:
    items: list = field(default_factory=list)   # NOT items: list = []
    tags: dict = field(default_factory=dict)    # [] would be shared → error
```

A bare mutable default (`= []`) raises `ValueError` — the decorator blocks the shared-state bug.

## order & frozen

```python
@dataclass(order=True)      # generates __lt__, __le__, __gt__, __ge__
class Ver:                  # compares as a tuple of fields, in order
    major: int
    minor: int
sorted([Ver(1, 2), Ver(1, 0)])   # [Ver(1,0), Ver(1,1)...]

@dataclass(frozen=True)     # immutable + hashable → usable in sets/dict keys
class Coord:
    x: int
    y: int
c = Coord(1, 2)
# c.x = 9   → raises FrozenInstanceError
{Coord(0, 0)}               # works — frozen dataclasses are hashable
```

## Helpers

```python
from dataclasses import asdict, replace
asdict(p)                   # {'x': 3, 'y': 4}
replace(p, x=99)            # new Point(x=99, y=4) — original unchanged
```

`frozen=True` gives you the [`__eq__`+`__hash__` contract](#comparable-objects) for free. For a tuple-like record without a class, see [`namedtuple`](#namedtuple).

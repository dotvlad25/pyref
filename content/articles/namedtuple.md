---
id: namedtuple
title: namedtuple
keywords: [namedtuple, collections, NamedTuple, typing, _replace, _asdict, _fields, record, immutable tuple, named fields, lightweight]
category: Data Structures
related: [dataclasses, classes, type-hints, comparable-objects]
---
# namedtuple

Reach for `namedtuple` when you want a lightweight, immutable record with named fields — it's a real `tuple` (indexable, unpackable, hashable) plus attribute access. Zero boilerplate.

```python
from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])   # or "x y"
p = Point(3, 4)

p.x, p.y          # 3 4      — attribute access
p[0]              # 3        — still a tuple (indexable)
x, y = p          # unpacks like a tuple
p == (3, 4)       # True     — compares as a tuple
```

## _replace, _asdict, _fields (the underscore API)

Underscored to avoid clashing with field names — they are public.

```python
p2 = p._replace(y=99)   # NEW Point(x=3, y=99); tuples are immutable
p._asdict()             # {'x': 3, 'y': 4}  (a dict)
Point._fields           # ('x', 'y')
Point._make([1, 2])     # build from an iterable → Point(x=1, y=2)
```

## Defaults & the typed variant

```python
Point = namedtuple("Point", "x y", defaults=[0])   # y defaults to 0
Point(5)                                            # Point(x=5, y=0)

# typing.NamedTuple — class syntax with annotations + methods
from typing import NamedTuple
class Point(NamedTuple):
    x: int
    y: int = 0
    def dist(self): return (self.x**2 + self.y**2) ** 0.5
```

## namedtuple vs dataclass

Use `namedtuple` for a small immutable value you compare/unpack like a tuple (great for heap entries and dict keys). Use [`@dataclass`](#dataclasses) when you want mutability, methods, or `order=`. Being a tuple, a namedtuple is hashable and works as a set element or dict key out of the box.

---
id: magic-methods
title: Dunder / Magic Methods
keywords: [dunder, magic method, special method, __repr__, __str__, __eq__, __lt__, __hash__, __len__, __getitem__, __iter__, __contains__, __call__, operator overloading]
category: OOP
type: reference
related: [classes, comparable-objects, dataclasses, slots, sorting-key]
---
# Dunder / Magic Methods

Dunder ("double underscore") methods hook your object into Python's syntax — operators, `len()`, iteration, printing. Implement the ones your object needs.

```python
class Vec:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __repr__(self):                 # unambiguous, for devs/debug
        return f"Vec({self.x}, {self.y})"

    def __eq__(self, other):            # == compares by value
        return (self.x, self.y) == (other.x, other.y)

    def __lt__(self, other):            # enables <, sorted(), min/max, heapq
        return (self.x, self.y) < (other.x, other.y)

    def __hash__(self):                 # required to use in set/dict keys
        return hash((self.x, self.y))   # must match __eq__

    def __len__(self):                  # len(v)
        return 2

    def __add__(self, o):               # v1 + v2
        return Vec(self.x + o.x, self.y + o.y)
```

## Why each matters

```python
v = Vec(1, 2)
print(v)              # Vec(1, 2)      — __repr__ (fallback for str too)
Vec(1, 2) == Vec(1, 2)   # True        — __eq__
sorted([Vec(3,0), Vec(1,9)])            # __lt__ powers the sort
{Vec(1, 2)}           # works          — __hash__ + __eq__
len(v)                # 2              — __len__
```

## Key gotchas

```python
# Defining __eq__ WITHOUT __hash__ makes the object UNHASHABLE
# (Python sets __hash__ = None) → can't put it in a set/dict.
# Provide both, or use @dataclass(frozen=True) / total_ordering.

# __repr__ vs __str__: __repr__ is the debug/unambiguous form and the
# fallback when __str__ is missing. Always define __repr__ at minimum.
```

Other useful dunders: `__iter__`/`__next__` (looping), `__getitem__` (indexing/`obj[k]`), `__contains__` (`in`), `__call__` (callable objects), `__bool__` (truthiness). For the full ordering set from just `__eq__`+`__lt__`, see [`total_ordering`](#comparable-objects).

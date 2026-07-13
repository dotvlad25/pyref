---
id: abc
title: Abstract Base Classes
keywords: [abc, abstract base class, ABC, abstractmethod, ABCMeta, interface, abstractproperty, cannot instantiate, subclass, register, protocol]
category: OOP
type: reference
related: [classes, magic-methods, type-hints, dataclasses]
---
# Abstract Base Classes

Reach for `abc` to define an interface: a base class that **can't be instantiated** and forces subclasses to implement specific methods.

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...        # subclasses MUST override

    def describe(self):                 # concrete methods allowed too
        return f"area={self.area()}"

# Shape()  → TypeError: Can't instantiate abstract class Shape
```

## Subclasses must implement every abstractmethod

```python
class Circle(Shape):
    def __init__(self, r): self.r = r
    def area(self):                     # provides the abstract method
        return 3.14159 * self.r ** 2

class Broken(Shape):
    pass
# Broken()  → TypeError: Can't instantiate abstract class Broken ...
Circle(2).describe()                    # 'area=12.566...'
```

## Combining with property / classmethod

```python
class Repo(ABC):
    @property
    @abstractmethod
    def name(self) -> str: ...          # abstract read-only property

    @classmethod
    @abstractmethod
    def connect(cls): ...
```

Stack `@abstractmethod` **innermost** (closest to `def`).

## isinstance / structural checks

```python
isinstance(Circle(1), Shape)   # True — real subclass
# abc.ABCMeta also lets you .register(cls) a class as a virtual subclass,
# and collections.abc provides ready-made ABCs (Iterable, Sequence, Mapping)
from collections.abc import Iterable
isinstance([1, 2], Iterable)   # True
```

For lightweight duck-typed interfaces without inheritance, `typing.Protocol` is the modern alternative (see [type hints](#type-hints)). Use ABC when you want enforcement at instantiation time.

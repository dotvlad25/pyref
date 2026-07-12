---
id: property
title: property (getters/setters)
keywords: [property, getter, setter, deleter, computed attribute, encapsulation, validation, descriptor, cached_property, read-only]
category: OOP
related: [classmethod-staticmethod, functools-cache, context-managers]
---
# property (getters/setters)

Reach for `@property` when an attribute needs computation or validation but you still want plain `obj.attr` access (no `get_x()`/`set_x()` calls). Start with a plain attribute; upgrade to a property later without changing callers.

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius            # convention: _ = "private" backing field

    @property
    def radius(self):                    # getter: accessed as c.radius (no parens)
        return self._radius

    @radius.setter
    def radius(self, value):             # setter: runs on c.radius = ...
        if value < 0:
            raise ValueError("radius must be >= 0")
        self._radius = value

    @property
    def area(self):                      # computed, read-only (no setter)
        return 3.14159 * self._radius ** 2

c = Circle(5)
c.radius        # 5      -> calls getter
c.radius = 10   # runs setter (validates)
c.area          # 314.159 -> recomputed each access
# c.area = 1    -> AttributeError: can't set attribute (no setter = read-only)
```

- `@property` defines the getter; `@<name>.setter` and `@<name>.deleter` add write/delete.
- Method name and attribute name must match; back the value in a differently-named field (`_radius`) to avoid infinite recursion (gotcha: `self.radius` inside the getter loops forever).
- No setter ⇒ read-only attribute (good for computed/derived values).
- Computed properties recompute every access. To compute once and cache, use `functools.cached_property` — see [functools cache](#functools-cache).

```python
from functools import cached_property

class Data:
    @cached_property
    def stats(self):                     # runs once, then stored on instance
        return expensive_scan(self.rows)
```

Related class helpers: [classmethod & staticmethod](#classmethod-staticmethod).

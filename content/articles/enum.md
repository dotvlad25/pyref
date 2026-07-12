---
id: enum
title: enum
keywords: [enum, Enum, auto, IntEnum, StrEnum, enumeration, constants, members, iteration, value, name, flag]
category: Standard Library
related: [classes, dataclasses, type-hints, namedtuple]
---
# enum

Reach for `Enum` to give a fixed set of named constants real identity — safer and more readable than raw strings or magic ints.

```python
from enum import Enum, auto

class Color(Enum):
    RED = 1
    GREEN = 2
    BLUE = auto()      # auto() → 3 (next int)

Color.RED             # <Color.RED: 1>
Color.RED.name        # 'RED'
Color.RED.value       # 1
Color(1)              # <Color.RED: 1>   — look up by value
Color["RED"]          # <Color.RED: 1>   — look up by name
```

## Members are singletons — compare with `is`

```python
Color.RED is Color.RED     # True
Color.RED == Color.GREEN   # False
# Plain Enum members are NOT comparable to their int values:
Color.RED == 1             # False!
```

## Iteration & membership

```python
for c in Color:            # iterates in definition order
    print(c.name, c.value)

list(Color)                # [Color.RED, Color.GREEN, Color.BLUE]
len(Color)                 # 3
Color.RED in Color         # True
```

## IntEnum / StrEnum — when you need the raw value to compare

```python
from enum import IntEnum
class Priority(IntEnum):
    LOW = 1
    HIGH = 3

Priority.HIGH > Priority.LOW   # True — IntEnum members ARE ints
Priority.HIGH == 3             # True
sorted(Priority)               # sorts by value
```

`StrEnum` (Python 3.11+) does the same for strings. Duplicate values become aliases; use `@enum.unique` to forbid them. Great as a [type hint](#type-hints) for a parameter that must be one of a fixed set.

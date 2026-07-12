---
id: type-hints
title: Type Hints
keywords: [type hints, annotations, typing, Optional, Union, list int, dict, Callable, Any, generics, mypy, TypeVar, Protocol, return type, arrow]
category: Language
type: reference
related: [classes, dataclasses, abc, enum, namedtuple]
---
# Type Hints

Annotations document intent and power static checkers (mypy/pyright). They are **not enforced at runtime** — purely informational.

```python
def add(a: int, b: int) -> int:      # param types + return type
    return a + b

def log(msg: str) -> None:           # -> None: returns nothing
    print(msg)

name: str = "ada"                    # variable annotation
```

## Built-in generics (Python 3.9+)

```python
nums: list[int]                      # was typing.List[int]
pairs: dict[str, int]                # was typing.Dict
coords: tuple[int, int]              # fixed-length
matrix: list[list[float]]
seen: set[str]
```

## Optional & unions

```python
from typing import Optional

def find(x: int) -> Optional[str]:   # str OR None
    ...
# Optional[str] == str | None
def g(x: int | None) -> str | int:   # 3.10+ union syntax
    ...
```

`Optional[T]` means "T or None" — it does **not** make an argument optional; a default value does that (`def f(x: int = 0)`).

## Callable, Any, and aliases

```python
from typing import Callable, Any

# a function taking (int, int) and returning bool
cmp: Callable[[int, int], bool]
handler: Callable[..., None]         # any args → None

data: Any                            # opts out of checking
Vector = list[float]                 # type alias for readability
```

## Where hints appear

```python
from dataclasses import dataclass
@dataclass
class Point:                         # annotations DEFINE the fields
    x: int
    y: int = 0
```

Hints have no runtime cost or effect on behavior, but tools like mypy catch bugs before you run. Dataclasses and `typing.NamedTuple` actually use annotations to build fields.

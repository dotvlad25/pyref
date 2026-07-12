---
id: singledispatch
title: functools.singledispatch
keywords: [functools, singledispatch, singledispatchmethod, generic function, type dispatch, overload, register, polymorphism, multiple dispatch]
category: Standard Library
related: [dispatch-table, functools-partial, functools-reduce, dict]
---
# functools.singledispatch

Turn a function into a **generic function** whose implementation is chosen by the type of the *first* argument — a clean alternative to a chain of `isinstance` checks.

```python
from functools import singledispatch

@singledispatch
def describe(x):                       # default / fallback
    return f"unknown: {x!r}"

@describe.register
def _(x: int):                         # dispatch by annotation
    return f"int doubled: {x * 2}"

@describe.register
def _(x: list):
    return f"list of {len(x)}"

describe(10)        # 'int doubled: 20'
describe([1, 2])   # 'list of 2'
describe("hi")     # "unknown: 'hi'"
```

Register with an explicit type (works pre-3.7 style, and for stacking):

```python
@describe.register(float)
@describe.register(complex)            # one impl for several types
def _(x):
    return f"number: {x}"
```

## In a class: singledispatchmethod

```python
from functools import singledispatchmethod

class Formatter:
    @singledispatchmethod
    def fmt(self, x):
        raise NotImplementedError(type(x))

    @fmt.register
    def _(self, x: int):
        return f"#{x}"
```

- Dispatch is on the first arg only (no multiple dispatch). Uses MRO, so subclasses match their base.
- Inspect resolution with `describe.registry` / `describe.dispatch(int)`.
- Reach for it in plugin-style code; for simple two-way branches a plain `if` or a [dict](#dict) of handlers is often clearer.

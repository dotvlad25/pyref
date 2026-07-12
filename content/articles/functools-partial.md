---
id: functools-partial
title: functools.partial
keywords: [functools, partial, currying, pre-bind, bind arguments, callback, freeze arguments, keyword defaults, higher order]
category: Standard Library
type: reference
related: [functools-reduce, singledispatch, sorting-key, functools-cache]
---
# functools.partial

Pre-bind some arguments of a function, producing a new callable with fewer parameters. Reach for it to make clean callbacks without writing throwaway lambdas.

```python
from functools import partial

def power(base, exp):
    return base ** exp

square = partial(power, exp=2)     # freeze exp
cube   = partial(power, exp=3)
square(5)      # 25
cube(2)        # 8
```

Positional args fill **left to right**; keyword args can be overridden at call time:

```python
int2 = partial(int, base=2)        # parse binary
int2("1010")                       # 10
int2("ff", base=16)                # 255 — override the bound kwarg
```

## Callbacks / key functions

```python
# de-clutter map/sort/callbacks vs. lambdas
prices = [1.2559, 3.001, 2.5]
rounded = list(map(partial(round, ndigits=2), prices))   # [1.26, 3.0, 2.5]

# bind config into a handler for an event loop / GUI / thread
button.on_click(partial(save, path="/tmp/out", overwrite=True))
```

Introspection: the result exposes `.func`, `.args`, `.keywords`.

```python
square.func       # <function power>
square.keywords   # {'exp': 2}
```

Gotcha: bound args are stored **once** — partial binds values, not live variables. Use [singledispatch](#singledispatch) for type-based dispatch and [reduce](#functools-reduce) for folding.

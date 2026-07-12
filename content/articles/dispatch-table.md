---
id: dispatch-table
title: Dispatch Table (dict of functions)
keywords: [dispatch table, dispatch dict, dict of functions, function map, handler map, replace if elif chain, action dispatch, jump table, command pattern, registry, lookup table]
category: Patterns
related: [state-machines, singledispatch, functools-partial, lambda, dict]
---
# Dispatch Table (dict of functions)

Replace a long `if/elif` chain that branches on a value with a **dict mapping the value to a function**. Cleaner to read, O(1) to dispatch, and trivially extensible — add a key, not another branch.

## The refactor

```python
# Instead of an if/elif ladder:
def handle(cmd, *args):
    if cmd == "add":
        return add(*args)
    elif cmd == "sub":
        return sub(*args)
    elif cmd == "mul":
        return mul(*args)
    raise ValueError(f"unknown command: {cmd!r}")

# Use a dispatch table:
OPS = {
    "add": add,
    "sub": sub,
    "mul": mul,
}

def handle(cmd, *args):
    fn = OPS.get(cmd)                 # O(1) lookup; None if missing
    if fn is None:
        raise ValueError(f"unknown command: {cmd!r}")
    return fn(*args)
```

Functions are first-class objects, so you can store them in a dict and call the one you look up.

## Inline handlers with lambdas

For short branches, define them inline:

```python
OPS = {
    "double": lambda x: x * 2,
    "negate": lambda x: -x,
    "square": lambda x: x * x,
}
result = OPS[name](value)
```

## Default handler

```python
def default(*args):
    raise ValueError("no handler")

OPS.get(cmd, default)(*args)          # fall back instead of KeyError
```

## When it fits

- **Best when branches share a call signature** — all handlers take the same args, so dispatch is uniform. If signatures differ, normalize them: give every handler `(context)` or `(*args)` and unpack inside.
- **Common uses:** command/action processors, parsers, event handlers, calculators, config-driven transforms (see [image pipeline](#image-pipeline)).
- **Related idioms:** map *states* to handlers → [state machines](#state-machines); dispatch on argument *type* → [singledispatch](#singledispatch); pre-bind arguments to a handler → [functools.partial](#functools-partial).

---
id: default-args-gotcha
title: Mutable Default Argument Gotcha
keywords: [mutable default argument, "def f(x=[])", shared default, None sentinel, list default, dict default, default parameter bug, evaluated once]
category: Language
type: concept
related: [closures, args-kwargs, nested-functions]
---
# Mutable Default Argument Gotcha

Default argument values are evaluated **once**, when the function is defined — not on each call. A mutable default (`[]`, `{}`, `set()`) is therefore **shared across every call**.

```python
def append_to(item, items=[]):     # BUG: one list shared by all calls
    items.append(item)
    return items

append_to(1)   # [1]
append_to(2)   # [1, 2]  <- surprise! same list persists
append_to(3)   # [1, 2, 3]
```

## Fix: use None as a sentinel

Default to `None`, then create a fresh object inside the body.

```python
def append_to(item, items=None):
    if items is None:
        items = []                 # fresh list every call
    items.append(item)
    return items

append_to(1)   # [1]
append_to(2)   # [2]  ✓
```

Book's compact form (works when an empty container is the only falsy input you expect):

```python
def f(items=None):
    items = items or []            # [] if items is None (or otherwise falsy)
```

> Careful: `items or []` also replaces a passed-in *empty but valid* list/`0`/`""`. When that distinction matters, prefer the explicit `if items is None` check.

## Why it happens

```python
def f(x=[]):
    ...
f.__defaults__      # ([],)  <- one object, stored on the function itself
```

The default lives on the function object and is reused. Same class of bug as [late binding in closures](#closures) — both come from *when* Python evaluates things. Immutable defaults (`0`, `None`, `"", ()`) are safe because you can't mutate them in place.

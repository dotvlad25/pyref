---
id: args-kwargs
title: "*args and **kwargs"
keywords: [args, kwargs, varargs, variadic, star args, double star, unpacking, forwarding, keyword-only, positional-only, splat]
category: Language
type: reference
related: [default-args-gotcha, lambda, nested-functions]
---
# *args and **kwargs

`*args` collects extra **positional** arguments into a tuple; `**kwargs` collects extra **keyword** arguments into a dict. Reach for them when a function accepts a variable number of inputs or forwards arguments onward.

```python
def f(*args, **kwargs):
    print(args)      # tuple of positionals
    print(kwargs)    # dict of keywords

f(1, 2, x=3, y=4)    # args=(1, 2)  kwargs={'x': 3, 'y': 4}
```

## Mix with normal params

```python
def connect(host, port=80, *args, timeout=30, **kwargs):
    ...
# order: positional, *args, keyword-only, **kwargs
```

## Forwarding (the most common real use)

Pass through all arguments to a wrapped function — the decorator pattern.

```python
def logged(fn):
    def wrapper(*args, **kwargs):
        print("calling", fn.__name__)
        return fn(*args, **kwargs)      # forward everything unchanged
    return wrapper
```

## Unpacking at the call site (the inverse)

`*` / `**` also *spread* a sequence/dict into arguments.

```python
nums = [1, 2, 3]
print(*nums)                 # print(1, 2, 3)

def point(x, y): ...
coords = {"x": 1, "y": 2}
point(**coords)              # point(x=1, y=2)
```

## Keyword-only and positional-only params

```python
def f(a, b, *, key):         # everything after * is keyword-only
    ...
f(1, 2, key=3)               # OK;  f(1, 2, 3) -> TypeError

def g(a, b, /, c):           # a, b are positional-only (Python 3.8+)
    ...
```

Naming is convention only — `*args`/`**kwargs` are idiomatic; the `*`/`**` is what matters. Avoid a mutable default alongside them (see [the default-arg gotcha](#default-args-gotcha)).

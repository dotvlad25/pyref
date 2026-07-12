---
id: decorators
title: Function Decorators
keywords: [decorator, wrapper, closure, higher-order function, wraps, timing, logging, instrumentation, syntactic sugar, decorate]
category: Language
type: reference
related: [decorators-with-args, functools-wraps, functools-cache, contextlib]
---
# Function Decorators

Reach for a decorator when you want to wrap a function with reusable behavior (timing, logging, caching, auth) without touching its body. A decorator is just a function that takes a function and returns a new one — built on a [closure](#decorators-with-args).

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):     # accept ANY signature
        # ... before ...
        result = func(*args, **kwargs)
        # ... after ...
        return result                # don't forget to return!
    return wrapper

@my_decorator                        # sugar for: greet = my_decorator(greet)
def greet(name):
    return f"Hi {name}"
```

Timing + logging example:

```python
import time
from functools import wraps

def timed(func):
    @wraps(func)                     # preserve name/docstring — see functools-wraps
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timed
def work(n):
    return sum(range(n))
```

- `@deco` above `def f` runs `f = deco(f)` at definition time — the wrapper replaces `f`.
- Always use `*args, **kwargs` so the wrapper accepts any signature.
- Always `return func(...)`'s result, or the function silently returns `None` (gotcha).
- Stack multiple: nearest decorator to `def` runs innermost.

```python
@timed
@my_decorator          # applied first (bottom-up): greet = timed(my_decorator(greet))
def greet(name): ...
```

Use [functools.wraps](#functools-wraps) to keep `__name__`/`__doc__`, and see [decorators with arguments](#decorators-with-args) for parametrized decorators.

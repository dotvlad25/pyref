---
id: decorators-with-args
title: Decorators with Arguments
keywords: [decorator, decorator factory, parametrized decorator, arguments, three-level nesting, closure, retry, repeat, wraps]
category: Language
related: [decorators, functools-wraps, functools-cache]
---
# Decorators with Arguments

Reach for this when a [decorator](#decorators) needs to be configured, e.g. `@retry(times=3)` or `@repeat(3)`. The trick: add one more layer. A parametrized decorator is a **decorator factory** — a function that returns a decorator.

Three levels of nesting:

```python
from functools import wraps

def repeat(times):                       # 1) factory: takes the ARGUMENT
    def decorator(func):                 # 2) the actual decorator: takes the FUNCTION
        @wraps(func)
        def wrapper(*args, **kwargs):    # 3) wrapper: takes CALL args
            for _ in range(times):
                result = func(*args, **kwargs)
            return result                # returns last call's result
        return wrapper
    return decorator

@repeat(times=3)                         # repeat(3) returns decorator, then decorates
def ping():
    print("pong")
```

`@repeat(3)` is evaluated as `ping = repeat(3)(ping)` — the factory runs first, returning the real decorator. `times` is captured by closure at each level.

Practical example — retry on exception:

```python
def retry(times=3, exceptions=(Exception,)):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions:
                    if attempt == times:
                        raise            # exhausted — re-raise
        return wrapper
    return decorator

@retry(times=5, exceptions=(ValueError,))
def parse(s): return int(s)
```

- Gotcha: `@repeat` (no parens) breaks — the factory expects an *argument*, not the function.
- Support both `@deco` and `@deco()` by defaulting the first arg to `None` and branching, but the 3-level form is the common default.
- Always `@wraps(func)` on the innermost wrapper — see [functools.wraps](#functools-wraps).

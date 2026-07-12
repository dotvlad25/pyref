---
id: functools-wraps
title: functools.wraps
keywords: [functools, wraps, decorator, __name__, __doc__, docstring, metadata, update_wrapper, __wrapped__, introspection]
category: Standard Library
related: [decorators, decorators-with-args, functools-cache]
---
# functools.wraps

Always add `@wraps(func)` to the inner wrapper of a [decorator](#decorators). Without it, the wrapped function loses its identity — `__name__`, `__doc__`, signature, and `__module__` all report the wrapper's instead.

```python
from functools import wraps

def log(func):
    @wraps(func)                 # copies func's metadata onto wrapper
    def wrapper(*args, **kwargs):
        print(f"calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@log
def add(a, b):
    "Add two numbers."
    return a + b
```

The difference:

```python
add.__name__    # 'add'   — with @wraps
                # 'wrapper' — WITHOUT @wraps (gotcha!)
add.__doc__     # 'Add two numbers.'  (else None)
add.__wrapped__ # the original undecorated function (added by @wraps)
```

- Why it matters: broken `__name__`/`__doc__` corrupt `help()`, debuggers, logging, and tools that dispatch on function names.
- `@wraps(func)` is itself a decorator; under the hood it calls `functools.update_wrapper(wrapper, func)`.
- Access the original via `add.__wrapped__` (useful to bypass the decorator in tests).

Equivalent explicit form:

```python
from functools import update_wrapper

def log(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return update_wrapper(wrapper, func)   # same effect, returns wrapper
```

Rule of thumb: every decorator you write should carry `@wraps` — see [decorators with arguments](#decorators-with-args) for placement inside the 3-level form.

---
id: context-managers
title: Context Managers (with)
keywords: [context manager, with statement, __enter__, __exit__, resource, cleanup, RAII, file, lock, setup teardown, as, try finally]
category: OOP
type: reference
related: [contextlib, decorators, property]
---
# Context Managers (with)

Reach for `with` when a resource must be released no matter what — files, locks, DB connections, sockets. The `with` block guarantees cleanup even if the body raises, replacing verbose `try/finally`.

```python
with open("data.txt") as f:      # __enter__ returns f
    data = f.read()
# f.close() called automatically here, even on exception
```

Equivalent to:

```python
f = open("data.txt")
try:
    data = f.read()
finally:
    f.close()                    # always runs — this is what `with` buys you
```

Build your own by defining `__enter__` and `__exit__`:

```python
class Timer:
    def __enter__(self):
        import time
        self.start = time.perf_counter()
        return self              # value bound to `as`

    def __exit__(self, exc_type, exc_val, exc_tb):
        import time
        self.elapsed = time.perf_counter() - self.start
        print(f"{self.elapsed:.4f}s")
        return False             # False = don't suppress exceptions (re-raise)

with Timer() as t:
    sum(range(10**6))
```

- `__enter__(self)` runs setup; its return value is bound by `as`.
- `__exit__(self, exc_type, exc_val, exc_tb)` runs teardown. Args are `None, None, None` on clean exit, or the exception info if the block raised.
- Return **truthy** from `__exit__` to *suppress* the exception; return `False`/`None` to let it propagate (the common case — gotcha: accidentally returning a truthy value swallows errors).
- Multiple managers in one statement: `with open(a) as f, open(b) as g:`.

For the lighter generator-based approach (`@contextmanager`), `suppress`, and `ExitStack`, see [contextlib](#contextlib).

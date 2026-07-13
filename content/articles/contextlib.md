---
id: contextlib
title: contextlib & @contextmanager
keywords: [contextlib, contextmanager, asynccontextmanager, generator, yield, suppress, ExitStack, closing, nullcontext, context manager, with, cleanup, decorator]
category: Standard Library
type: reference
related: [context-managers, decorators, functools-wraps]
---
# contextlib & @contextmanager

Reach for `@contextmanager` to write a [context manager](#context-managers) as a generator instead of a class — far less boilerplate. Code before `yield` is setup (`__enter__`); code after is teardown (`__exit__`).

```python
from contextlib import contextmanager

@contextmanager
def managed(resource):
    r = acquire(resource)        # setup
    try:
        yield r                  # value bound to `as`; body runs here
    finally:
        release(r)               # teardown — runs even on exception

with managed("db") as conn:
    conn.query(...)
```

- The `try/finally` around `yield` is what guarantees cleanup — put teardown in `finally`.
- Exactly one `yield`. An exception in the body is raised *at* the `yield` line, so `finally` (or `except`) catches it.

`suppress` — ignore specific exceptions cleanly:

```python
from contextlib import suppress

with suppress(FileNotFoundError):
    os.remove("maybe.txt")       # no error if missing; beats try/except/pass
```

`ExitStack` — manage a dynamic/unknown number of managers:

```python
from contextlib import ExitStack

with ExitStack() as stack:
    files = [stack.enter_context(open(p)) for p in paths]
    # all files closed at block exit, in reverse order
```

Other handy helpers:

```python
from contextlib import closing, nullcontext, redirect_stdout

with closing(urlopen(url)) as page:   # calls .close() on exit
    ...

cm = open(path) if path else nullcontext(sys.stdout)  # optional resource
with cm as f: ...                     # nullcontext is a no-op manager
```

`@contextmanager` also makes the function usable as a decorator (since Python 3.2, via `ContextDecorator`). For async setup/teardown, `asynccontextmanager` builds an `async with` manager from an `async def` generator. For the raw `__enter__`/`__exit__` protocol, see [context managers](#context-managers).

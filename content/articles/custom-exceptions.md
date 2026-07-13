---
id: custom-exceptions
title: Custom Exceptions
keywords: [custom exception, subclass Exception, exception hierarchy, user-defined error, base exception, raise, __init__ exception, error class]
category: Language
type: reference
related: [exception-handling, raising-exceptions]
---
# Custom Exceptions

Define your own exception by subclassing `Exception` (never `BaseException` — that's for `SystemExit`/`KeyboardInterrupt`). Reach for one when built-in types don't convey intent, or so callers can catch *your* errors specifically.

```python
class ValidationError(Exception):
    """Raised when input fails validation."""

raise ValidationError("name is required")
```

An empty subclass is fully usable — inherited `__init__` stores the message.

## Add structured data

```python
class HTTPError(Exception):
    def __init__(self, status, message):
        super().__init__(status, message)  # store raw args -> picklable
        self.status = status
        self.message = message
    def __str__(self):
        return f"{self.status}: {self.message}"

try:
    raise HTTPError(404, "not found")
except HTTPError as e:
    print(e.status)     # 404
    print(e)            # 404: not found
```

Pass the raw values to `super().__init__` (they land in `e.args`), not a
pre-formatted string. This keeps the exception picklable/copyable — needed
when it crosses process boundaries (`multiprocessing`, `concurrent.futures`).
Use `__str__` for the human-readable form.

## Build a hierarchy (catch broadly or narrowly)

```python
class AppError(Exception):          # common base for the whole app
    pass

class NotFoundError(AppError):
    pass

class AccessDeniedError(AppError):   # avoid shadowing built-in PermissionError
    pass

try:
    raise NotFoundError("user 7")
except AppError as e:               # base catches ALL subclasses
    print("app-level:", e)
```

Catching a base class catches every subclass, so a shared base lets callers handle a whole family in one `except`. Naming convention: suffix classes with `Error`. See [exception-handling](#exception-handling) for catching and [raising-exceptions](#raising-exceptions) for `raise ... from`.

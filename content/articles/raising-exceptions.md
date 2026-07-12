---
id: raising-exceptions
title: Raising & Chaining Exceptions
keywords: [raise, raise from, re-raise, exception chaining, __cause__, __context__, from None, bare raise, reraise, wrap exception, suppress context]
category: Language
type: reference
related: [exception-handling, custom-exceptions]
---
# Raising & Chaining Exceptions

Trigger an exception with `raise`. Reach for it to signal precondition failures, wrap lower-level errors, or re-throw after logging.

```python
def sqrt(x):
    if x < 0:
        raise ValueError(f"negative input: {x}")   # raise an instance
    ...
```

## Re-raise: bare `raise` inside an except

Keeps the original traceback — do this after logging/partial handling.

```python
try:
    process()
except Exception:
    log.error("process failed")
    raise                    # re-raises the SAME exception, traceback intact
```

## Chaining: `raise ... from` (explicit cause)

Wrap a low-level error in a domain-specific one while preserving the original.

```python
class ConfigError(Exception):
    pass

try:
    port = int(cfg["port"])
except ValueError as e:
    raise ConfigError("invalid port") from e   # sets e as __cause__
```

Output shows both: *"The above exception was the direct cause of the following exception."*

## Implicit chaining (happens automatically)

If an exception is raised *during* handling of another, Python links them via `__context__` and prints *"During handling of the above exception, another occurred."*

```python
try:
    d["missing"]             # KeyError
except KeyError:
    1 / 0                    # ZeroDivisionError — KeyError shown as context
```

## Suppress the chain with `from None`

```python
try:
    port = int(cfg["port"])
except ValueError:
    raise ConfigError("invalid port") from None   # hides the original cause
```

Use `raise` (bare) to re-throw, `raise X from e` to wrap-and-keep-cause, and `from None` for a clean message. See [exception-handling](#exception-handling) and [custom-exceptions](#custom-exceptions).

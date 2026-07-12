---
id: exception-handling
title: try/except/else/finally
keywords: [exception, try, except, else, finally, catch, error handling, ValueError, KeyError, IndexError, ZeroDivisionError, cleanup, multiple exceptions, as]
category: Language
type: reference
related: [custom-exceptions, raising-exceptions, dict]
---
# try/except/else/finally

Python uses `try/except`. Reach for it when failure is expected and recoverable — but for dicts, prefer `.get()` over catching `KeyError`.

```python
# Catch a single type
try:
    n = int(user_input)      # ValueError if not a number
except ValueError:
    n = 0                    # fallback
```

## Multiple exception types

```python
try:
    val = d[key]             # KeyError if missing
    result = 10 / val        # ZeroDivisionError if val == 0
except (KeyError, ZeroDivisionError):   # tuple = catch any of these
    result = -1
```

## Capture the exception object with `as`

```python
try:
    risky()
except ValueError as e:
    print(f"bad value: {e}")     # e has the message/args
```

## else and finally

```python
try:
    x = int(s)
except ValueError:
    x = 0
else:
    print(f"parsed {x}")     # runs ONLY if no exception was raised
finally:
    print("done")            # ALWAYS runs — even on exception or return
```

`else` keeps the "success path" out of the `try` (so it can't accidentally catch unrelated errors). `finally` is for cleanup that must happen regardless (closing files, releasing locks) — though a `with` block is cleaner for resources.

## Common exceptions & the .get() shortcut

```python
# ValueError  bad conversion  | KeyError missing key | IndexError out of bounds
v = d.get(k, 0)              # prefer this over try/except KeyError — one line
```

Order matters: put specific `except` clauses before broad ones. Avoid a bare `except:` — it swallows `KeyboardInterrupt` too; use `except Exception:` if you must be broad. See [custom exceptions](#custom-exceptions) and [raising & chaining](#raising-exceptions).

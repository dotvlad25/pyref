---
id: truthiness
title: Truthiness & Falsy Values
keywords: [truthiness, falsy, truthy, empty container, bool, none, zero, empty string, or and short circuit, if not, default value, __bool__, __len__]
category: Language
type: concept
related: [is-vs-equals, default-args-gotcha]
---
# Truthiness & Falsy Values

Any object can be tested in a boolean context. The **falsy** set is fixed — everything else is truthy.

```python
# Falsy values:
False, None, 0, 0.0, 0j          # zero of any numeric type
"", [], (), {}, set(), range(0)  # empty containers/sequences
```

```python
bool([])     # False
bool([0])    # True  — non-empty (contents don't matter!)
bool("0")    # True  — non-empty string, even "0"
bool(" ")    # True  — whitespace is non-empty
```

## Idiomatic empty checks

```python
if not lst:  ...     # ✓ empty list/None/""  — preferred
if lst == []: ...    # ✗ verbose, misses None
if len(lst) == 0:    # ✗ unnecessary
```

Caution: `if not lst` treats `[]`, `None`, `0`, `""` alike. When you must distinguish "empty" from "missing", use `if lst is None` ([is vs ==](#is-vs-equals)).

## or / and return an OPERAND, not a bool

`or` returns the first truthy value (or the last); `and` returns the first falsy (or the last). Both short-circuit.

```python
"" or "default"      # 'default'  — common default idiom
0 or 5               # 5
"hi" or "default"    # 'hi'
None and f()         # None       — f() never called (short-circuit)
5 and 10             # 10         — both truthy -> last
```

```python
name = user_input or "guest"     # fallback when empty/None
items = items or []              # the mutable-default fix (#default-args-gotcha)
```

Gotcha: `x or default` also overrides a valid falsy `x` (like `0` or `""`). When `0`/`""` are legal inputs, test `x is None` instead.

## Custom objects

```python
class Bag:
    def __init__(self, items): self.items = items
    def __bool__(self):  return bool(self.items)   # checked first
    # if no __bool__, Python falls back to __len__() != 0
```

Use `any(iterable)` / `all(iterable)` to fold truthiness over a sequence (short-circuiting, O(n)). On an empty iterable `all([])` is `True` and `any([])` is `False`.

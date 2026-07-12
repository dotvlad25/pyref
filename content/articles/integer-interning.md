---
id: integer-interning
title: Integer Interning (Small Int Cache)
keywords: [integer interning, small int cache, "-5 to 256", is on ints, identity int, id(), cpython cache, why is fails, use == for numbers, int object reuse, cached integers, is vs equals int]
category: Language
type: concept
related: [is-vs-equals, integer-arithmetic, truthiness, pass-by-object-reference]
---
# Integer Interning (Small Int Cache)

CPython **pre-allocates (interns) integers -5 to 256** inclusive. Every reference to such a value points at the *same* cached object — so `is` accidentally returns `True`. Outside that range, you get fresh objects.

```python
x = 1; y = 1
print(x is y)     # True  — 1 is cached (in -5..256)

# Force two distinct objects so the result is reliable (see caveat below):
x = int("1000"); y = int("1000")
print(x is y)     # False — outside cache; two distinct objects
print(x == y)     # True  — values are equal (what you actually want)
```

## Why it surprises

`is` compares **identity** (`id(a) == id(b)`), not value. The cache makes `is` *seem* to work for small ints, then silently break for large ones — a classic trap.

```python
a = 256; b = 256
a is b                    # True  — cached boundary
c = int("257"); d = int("257")
c is d                    # False — one past the cache (CPython impl detail!)
```

## The rule

```python
# Numbers  -> ALWAYS use ==   (value comparison)
if count == 257: ...          # correct
if count is 257: ...          # BUG: relies on interning; SyntaxWarning in 3.8+

# `is` is only for singletons:
if x is None: ...             # correct use of identity
```

## Caveats

- **Implementation detail**, not a language guarantee — PyPy/Jython may differ, and the exact range can vary by version/context.
- REPL vs a compiled code block differ: two equal literals in **one** code object (e.g. `x = 1000; y = 1000` run as a script) are folded to a *single* constant, so `x is y` is `True` even above 256. Typing them on separate REPL lines, or building the ints dynamically (`int("1000")`), gives distinct objects. That's why the demos above use `int(...)`.
- Never branch on integer identity. See [is vs ==](#is-vs-equals).

```python
# Takeaway: == for values, is only for None/singletons. Never trust int `is`.
```

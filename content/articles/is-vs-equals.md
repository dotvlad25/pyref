---
id: is-vs-equals
title: is vs == & Integer Caching
keywords: [is vs equals, identity, equality, is operator, small int cache, integer caching, string interning, is none, id(), same object, reference comparison]
category: Language
type: concept
related: [truthiness, dict]
---
# is vs == & Integer Caching

`==` compares **values** (calls `__eq__`). `is` compares **identity** (same object in memory, `id(a) == id(b)`).

```python
a = [1, 2, 3]
b = [1, 2, 3]
a == b      # True  — equal values
a is b      # False — different objects
c = a
a is c      # True  — same object (alias)
```

## Rule: use `is` only for singletons

```python
x is None         # ✓ correct — None is a singleton
x is True         # ✓ (rarely needed)
if x == None      # ✗ works but non-idiomatic; can misfire on custom __eq__
```

Never use `is` to compare values — that's what `==` is for.

## Small-int cache (why `is` sometimes "works")

CPython pre-caches ints **-5 to 256**, so identical small ints share one object. Outside that range, identity is not guaranteed.

```python
a = 256; b = 256
a is b                    # True  — cached
x = int("257"); y = int("257")   # build distinct objects so the result is reliable
x is y                    # False — separate objects (CPython impl detail!)
x == y                    # True  — always use == for values
```

This is an implementation detail — **never rely on it**. Relying on `is` for numbers is a silent bug; see [integer interning](#integer-interning).

## String interning

Some string literals are interned (share identity), but this too is unreliable:

```python
"hi" is "hi"        # often True (interned literal) — don't depend on it
a = "".join(["h","i"])
a is "hi"           # typically False; a == "hi" is True
```

## Takeaway

```python
# Values:      ==
# Singletons:  is None / is not None
# Identity/alias check (rare): is
```

Aliasing (two names, one object) is what `is` reveals — the root of many [copy bugs](#shallow-deep-copy).

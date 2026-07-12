---
id: string-basics
title: Strings Are Immutable
keywords: [string, str, immutable, immutability, concatenation, join, build string, O(n^2), interning, intern, is vs ==, unicode, plus equals]
category: Language
type: concept
related: [string-methods, string-split-join, ascii-ord-chr, set]
---
# Strings Are Immutable

Python strings are immutable sequences of Unicode characters. Every "modifying" operation returns a **new** string — the original never changes. Reach for this when building output in a loop.

```python
s = "hello"
s.replace("l", "L")   # -> "heLLo" (new string)
s                     # still "hello" — unchanged!
```

## Never concatenate in a loop

```python
# BAD: each += allocates a new string -> O(n^2) total
result = ""
for word in words:
    result += word

# GOOD: collect parts, join once -> O(n)
result = "".join(words)
```

**Rule:** build a `list` of parts, then call `"".join()` at the end. `join()` pre-allocates the buffer once. No `StringBuilder` needed. See [split & join](#string-split-join).

```python
parts = []
for c in s:
    if c.isalpha():
        parts.append(c.lower())
result = "".join(parts)     # O(n)
```

## Interning & `is` vs `==`

CPython *interns* some strings (short literals, identifiers) so identical literals may share one object. This is an implementation detail — never rely on it.

```python
a = "abc"; b = "abc"
a is b     # often True (interned) — DON'T depend on this
a == b     # True — ALWAYS use == for value comparison
```

Same caveat as [integer interning](#) — `is` checks identity, `==` checks value.

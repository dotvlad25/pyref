---
id: string-immutability
title: "String Immutability and Concatenation Performance"
keywords: [string immutable, immutability, str concatenation, plus equals in loop, quadratic, o(n^2), join, build string, stringbuilder, list then join, new string object]
category: Language
related: [string-basics, string-methods, string-split-join, list-methods]
---
# String Immutability and Concatenation Performance

Python `str` is **immutable**: every "modifying" operation returns a *new* string; the original is never changed in place.

```python
s = "hello"
s.replace("l", "L")   # returns "heLLo"
# s is still "hello"  -- replace() does not mutate

s[0] = "H"            # TypeError: str does not support item assignment
s = "H" + s[1:]       # rebind to a new string instead
```

## The O(n^2) concatenation trap

Because each `+=` allocates a brand-new string and copies all prior characters, concatenating in a loop is **O(n^2)**.

```python
# BAD: each += copies the whole accumulated string -> O(n^2) total
result = ""
for word in words:
    result += word          # allocates a new string every iteration
```

## The O(n) idiom: collect into a list, then join

`"".join(...)` pre-allocates the buffer once and copies each piece a single time — **O(n)**.

```python
# GOOD: O(n)
result = "".join(words)

# When you transform pieces, build a list then join once
parts = []
for word in words:
    parts.append(word.upper())
result = ", ".join(parts)

# Same idiom for chars
cleaned = "".join(c.lower() for c in s if c.isalpha())
```

**Rule:** never build a string with `+=` in a loop. Collect fragments in a `list`, then call `"".join()` at the end. See [string-split-join](#string-split-join).

Immutability also makes strings **hashable** — usable as dict keys and set members (see [hashable-objects](#hashable-objects)).

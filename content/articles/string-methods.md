---
id: string-methods
title: Essential String Methods
keywords: [string methods, strip, lstrip, rstrip, split, replace, find, startswith, endswith, lower, upper, isalpha, isdigit, isalnum, count, casefold, title, swapcase]
category: Language
type: reference
related: [string-basics, string-split-join, string-search, string-formatting]
---
# Essential String Methods

The core string toolkit. All return **new** strings ([immutable](#string-basics)).

```python
s = "  Hello, World!  "

# Whitespace & case
s.strip()          # "Hello, World!"  (also lstrip / rstrip)
"xxhixx".strip("x")# "hi"  strips any chars in the set from both ends, not a substring
s.lower()          # "  hello, world!  "
s.upper()          # "  HELLO, WORLD!  "
s.casefold()       # aggressive lower (unicode-correct compare)
```

## Search & replace

```python
"hello".find("ll")          # 2   (returns -1 on miss)
"hello".index("ll")         # 2   (raises ValueError on miss)
"hello".count("l")          # 2
"hello".replace("l", "r")   # "herro"  (all occurrences)
"hello".replace("l", "r", 1)# "herlo"  (max count)
```

Prefer [`find`](#string-search) over `index` when a missing substring is expected — no exception to guard.

## Prefix / suffix checks

```python
"hello world".startswith("hello")   # True
"file.py".endswith((".py", ".pyi")) # True — accepts a tuple
```

## Character-class predicates (parsing)

```python
"abc".isalpha()      # True
"123".isdigit()      # True
"abc123".isalnum()   # True
"   ".isspace()      # True
```

All predicates return `False` on `""`. `isdigit()` also accepts non-ASCII digits (e.g. `"²"`) that `int()` rejects; use `isdecimal()` to test int-parsability.

```python
# Palindrome ignoring non-alphanumerics
def is_palindrome(s):
    cleaned = [c.lower() for c in s if c.isalnum()]
    return cleaned == cleaned[::-1]
```

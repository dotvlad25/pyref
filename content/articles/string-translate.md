---
id: string-translate
title: str.translate & maketrans
keywords: [translate, maketrans, str.maketrans, character mapping, delete chars, remove characters, replace multiple, char map, cleaning, sanitize, rot13, punctuation removal]
category: Language
related: [string-methods, ascii-ord-chr, string-basics, string-search]
---
# str.translate & maketrans

`str.translate(table)` remaps or deletes characters in **one pass** — faster than chained `.replace()` calls for multiple single-char substitutions.

## Build the table with `str.maketrans`

```python
# 1) Three-arg form: map, map, DELETE
table = str.maketrans("abc", "xyz", "!?")
"a b c!?".translate(table)     # "x y z"  — a->x,b->y,c->z, and !? removed
```

The first two args must be equal-length strings (char i -> char i). The third arg is a string of characters to drop.

## Delete-only (fast char removal)

```python
# Remove all punctuation in one pass
import string
no_punct = str.maketrans("", "", string.punctuation)
"Hello, World!".translate(no_punct)   # "Hello World"
```

## Dict form — map to strings, ints, or None

```python
# Keys are ord() code points; values are str/int/None
table = {ord("a"): "4", ord("e"): "3", ord(" "): None}
"a bad seed".translate(table)   # "4b4ds33d"  — space deleted
```

## ROT13 example

```python
import string
lower = string.ascii_lowercase
rot13 = str.maketrans(lower, lower[13:] + lower[:13])
"hello".translate(rot13)   # "uryyb"
```

Use `translate` when replacing/removing a *set* of chars; for a single substring swap, plain [`replace`](#string-methods) is clearer. See also [ord/chr](#ascii-ord-chr) for the code-point view.

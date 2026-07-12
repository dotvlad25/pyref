---
id: regex-common-patterns
title: Common Regex Patterns
keywords: [regex patterns, email regex, phone, digits, integer, float, whitespace, word boundary, \b, url, ip address, hex, split on whitespace, trim, validation]
category: Standard Library
related: [regex-basics, regex-search-match, regex-findall-sub, regex-groups, regex-compile]
---
# Common Regex Patterns

Copy-paste starting points. Use `fullmatch` for validation, `findall`/`finditer` for extraction. See [search vs match](#regex-search-match).

## Numbers

```python
import re
r"\d+"                 # one or more digits (unsigned int run)
r"[-+]?\d+"            # signed integer
r"[-+]?\d*\.?\d+"      # int or float: 3, -3, 0.5, .5, 12.34
re.findall(r"[-+]?\d*\.?\d+", "x=-3 y=0.5")   # ['-3', '0.5']
```

## Word boundaries \b

```python
# \b is a zero-width anchor between a word char (\w) and a non-word char.
re.findall(r"\bcat\b", "cat category cats")   # ['cat']  whole word only
re.sub(r"\bfoo\b", "bar", "foo food")         # "bar food"
```

## Whitespace handling

```python
re.split(r"\s+", "a  b\tc\nd")   # ['a', 'b', 'c', 'd']  split on any run
re.sub(r"\s+", " ", "a   b").strip()   # "a b"  collapse whitespace
```

## Email (simplified — real RFC email is far hairier)

```python
EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
EMAIL.findall("a@x.com, b.c+tag@sub.org")   # ['a@x.com', 'b.c+tag@sub.org']
bool(EMAIL.fullmatch("nope@"))               # False
```

## Other handy ones

```python
r"^\d{4}-\d{2}-\d{2}$"                 # ISO date YYYY-MM-DD
r"\b(?:\d{1,3}\.){3}\d{1,3}\b"         # IPv4 (loose — no 0-255 range check)
r"#?[0-9a-fA-F]{6}"                    # hex color
r"https?://[^\s]+"                     # URL (greedy to first whitespace)
r"[A-Z][a-z]+"                         # Capitalized word
```

Gotcha: dot `.` inside a char class `[...]` is a literal dot, so `[\w.-]` needs no escape. Reach for [character classes](#regex-basics) to build your own.

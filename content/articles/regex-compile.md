---
id: regex-compile
title: Compiled Patterns & Flags
keywords: [re.compile, compiled pattern, flags, re.IGNORECASE, re.I, re.MULTILINE, re.M, re.DOTALL, re.S, re.VERBOSE, re.X, inline flags, pattern object, performance]
category: Standard Library
type: reference
related: [regex-basics, regex-search-match, regex-findall-sub, regex-groups]
---
# Compiled Patterns & Flags

`re.compile` turns a pattern into a reusable object — compile once, use many times (cleaner and slightly faster in loops).

```python
import re
pat = re.compile(r"\d+")
pat.search("a12")     # same methods: .search .match .fullmatch .findall .sub
pat.findall("1 22 3") # ['1', '22', '3']
# Module-level re.search(...) also caches recent patterns, but explicit
# compile documents intent and avoids re-passing the string everywhere.
```

## Flags

```python
re.IGNORECASE  # re.I  case-insensitive
re.MULTILINE   # re.M  ^ and $ match at every line boundary, not just string
re.DOTALL      # re.S  . also matches newline
re.VERBOSE     # re.X  ignore whitespace/comments in the pattern
```

```python
re.findall(r"error", "ERROR error", re.IGNORECASE)   # ['ERROR', 'error']

# MULTILINE: ^ anchors to each line start
re.findall(r"^\w+", "foo\nbar", re.MULTILINE)        # ['foo', 'bar']

# DOTALL: let . span across newlines
re.search(r"a.b", "a\nb", re.DOTALL).group()          # "a\nb"
```

## Combine flags with |

```python
pat = re.compile(r"^err", re.IGNORECASE | re.MULTILINE)
```

## VERBOSE — self-documenting patterns

```python
phone = re.compile(r"""
    (\d{3})   # area code
    [-.\s]?   # optional separator
    (\d{4})   # line number
""", re.VERBOSE)     # literal spaces must be escaped or in a class
phone.search("555-1234").groups()   # ('555', '1234')
```

Inline alternative: `(?i)` at the pattern start = IGNORECASE, `(?im)` combines. Build the pattern from [basics](#regex-basics) and pair with [named groups](#regex-groups).

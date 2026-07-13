---
id: regex-search-match
title: search vs match vs fullmatch
keywords: [re.search, re.match, re.fullmatch, anchoring, anchor, start of string, match object, group, span, none, first match]
category: Standard Library
type: reference
related: [regex-basics, regex-findall-sub, regex-groups, regex-compile]
---
# search vs match vs fullmatch

All three return a **match object** on success or **`None`** on failure — the difference is *where* the pattern must line up.

```python
import re

re.match(r"\d+", "abc123")      # None  -> must match at START of string
re.match(r"\d+", "123abc")      # <Match 0-3> matches "123"
re.search(r"\d+", "abc123")     # <Match 3-6> finds first match ANYWHERE
re.fullmatch(r"\d+", "123abc")  # None  -> must match the ENTIRE string
re.fullmatch(r"\d+", "123")     # <Match 0-3>
```

Think: `match` = implicit `^` at the start; `fullmatch` = implicit `^...$` around the whole thing; `search` = no anchor.

## Always guard against None

```python
m = re.search(r"Error (\d+)", "Error 404")
if m:                       # truthy only when it matched
    print(m.group(0))       # "Error 404"  whole match
    print(m.group(1))       # "404"        first captured group
    print(m.span())         # (0, 9)       (start, end) indices
    print(m.start(), m.end())
# m.group() on a None crashes -> AttributeError, so check first.
```

## Equivalences

```python
# match(p, s)     ~= search(r"^"  + p, s)
re.search(r"^\d+", "123abc")   # like match
# fullmatch(p, s) ~= search("^" + p + "$", s)  (but cleaner + stricter)
```

These are only exact in the default mode. Under `re.MULTILINE`, `^`/`$` match at every line boundary, while `match`/`fullmatch` always anchor to the string ends. Also `$` matches just *before* a trailing `\n`, so `re.search(r"^\d+$", "123\n")` succeeds but `re.fullmatch(r"\d+", "123\n")` is `None` — prefer `fullmatch` (or `\Z`) for strict validation.

Use `fullmatch` for validation ("is this string entirely a valid X?") and `search` for extraction ("does this contain an X?"). See [findall & finditer](#regex-findall-sub) for *all* matches and [groups](#regex-groups) for extracting parts.

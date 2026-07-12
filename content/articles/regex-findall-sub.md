---
id: regex-findall-sub
title: findall, finditer & sub
keywords: [re.findall, re.finditer, re.sub, re.subn, replace, extract all, count matches, non-overlapping, iterator, match objects, substitution, backreference replace]
category: Standard Library
related: [regex-basics, regex-search-match, regex-groups, regex-compile, regex-common-patterns]
---
# findall, finditer & sub

`search` gives one match; these scan the whole string for **all non-overlapping** matches, left to right.

## findall — list of strings

```python
import re
text = "Error 404: not found at 10:45 AM"

re.findall(r"\d{2}:\d{2}", text)   # ['10:45']
re.findall(r"\d+", text)           # ['404', '10', '45']  runs of digits

# GOTCHA: with 1 group, returns the GROUP text, not the whole match.
re.findall(r"(\d+):(\d+)", text)   # [('10', '45')]  tuples with >1 group
```

## finditer — lazy iterator of match objects

```python
# Prefer when you need positions or groups; memory-efficient for big text.
for m in re.finditer(r"\d+", text):
    print(m.group(), m.span())     # '404' (6,9), '10' (24,26), '45' (27,29)
```

## sub / subn — replace

```python
# re.sub replaces EVERY non-overlapping match, left to right.
re.sub(r"\d+", "X", text)          # "Error X: not found at X:X AM"
re.sub(r"\d+", "X", text, count=1) # "Error X: ... 10:45 AM"  cap replacements
re.subn(r"\d+", "X", text)         # ("Error X: ...", 3)  also returns count
```

## Replacement backrefs & callable

```python
# Reference captured groups with \1 (or \g<name>) in the replacement string.
re.sub(r"(\w+)@(\w+)", r"\2:\1", "bob@corp")   # "corp:bob"

# Pass a function for computed replacements — gets each match object.
re.sub(r"\d+", lambda m: str(int(m.group()) * 2), "a1 b2")  # "a2 b4"
```

Each is O(N) over the input. Use [named groups](#regex-groups) with `\g<name>` for readable substitutions; [compile](#regex-compile) the pattern if reusing it in a loop.

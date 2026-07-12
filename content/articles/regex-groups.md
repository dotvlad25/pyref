---
id: regex-groups
title: Groups & Named Groups
keywords: [regex groups, capturing group, named group, P<name>, groupdict, non-capturing group, backreference, alternation, group index, groups method, optional group]
category: Standard Library
type: reference
related: [regex-basics, regex-search-match, regex-findall-sub, regex-compile]
---
# Groups & Named Groups

Parentheses `(...)` capture a substring so you can pull out the pieces you care about.

## Numbered groups

```python
import re
m = re.search(r"(\d{4})-(\d{2})-(\d{2})", "date 2026-07-11")
m.group(0)     # "2026-07-11"  whole match
m.group(1)     # "2026"        first group (1-indexed)
m.group(2, 3)  # ('07', '11')  several at once
m.groups()     # ('2026', '07', '11')  all groups as a tuple
```

## Named groups (?P<name>...)

```python
pat = r"(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})"
m = re.search(pat, "2026-07-11")
m.group("year")     # "2026"   access by name
m.groupdict()       # {'year': '2026', 'month': '07', 'day': '11'}
# Named groups read far better than group(1)/group(2) in real code.
```

## Non-capturing group (?:...)

```python
# Group for grouping (alternation / quantifier) WITHOUT creating a capture.
re.findall(r"(?:ab)+", "abab ab")   # ['abab', 'ab']  no captured subgroup
re.search(r"(?:https?)://(\w+)", "https://corp").group(1)  # "corp"
```

## Backreferences — match the same text again

```python
# \1 in the PATTERN means "the text group 1 already matched".
re.search(r"(\w+) \1", "the the end")   # matches "the the" (duplicate word)
re.search(r"(?P<c>\w)(?P=c)", "aa")     # named backref: (?P=name)
```

## Gotchas

```python
m = re.search(r"(a)(b)?", "a")
m.group(2)     # None  -> unmatched optional group is None, not ""
```

Use `\g<name>` in [sub replacements](#regex-findall-sub); prefer named groups whenever a pattern has more than one capture.

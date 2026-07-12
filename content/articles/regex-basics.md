---
id: regex-basics
title: re Module Basics
keywords: [regex, regular expression, re module, raw string, r-string, metacharacters, character class, escape, backslash, wildcard, quantifier, anchor, pattern]
category: Standard Library
related: [regex-search-match, regex-findall-sub, regex-groups, regex-compile, regex-common-patterns]
---
# re Module Basics

Reach for `re` when simple `str` methods (`in`, `.startswith`, `.split`) aren't enough to match variable structure.

```python
import re

text = "Error 404: Page not found at 10:45 AM"
match = re.search(r"Error (\d+)", text)   # first match anywhere
if match:
    code = match.group(1)                 # "404"
```

## Always use raw strings

```python
r"\d+"      # raw: backslash passed straight to the regex engine
"\d+"       # works, but "\n" or "\b" would be interpreted by Python first
# Rule: write EVERY pattern as r"..." to avoid double-escaping surprises.
```

## Metacharacters

```python
# .  any char except newline      ^  start        $  end
# *  0 or more   +  1 or more     ?  0 or 1 (or make quantifier lazy)
# {m,n}  m to n repeats           |  alternation (a|b)
# ()  group      []  char class   \  escape a metachar
re.findall(r"a.c", "abc a_c a\nc")   # ['abc', 'a_c']  (. skips newline)
re.findall(r"colou?r", "color colour")  # ['color', 'colour']
```

## Character classes & shorthands

```python
# \d digit  \w word char [A-Za-z0-9_]  \s whitespace   (uppercase = negation)
# \D non-digit  \W non-word  \S non-space
re.findall(r"[aeiou]", "banana")     # ['a','a','a']  set of chars
re.findall(r"[^0-9]", "a1b2")        # ['a','b']      ^ inside [] = NOT
re.findall(r"[a-fA-F]", "Gx3aF")     # ['a','F']      ranges
```

Greedy by default; add `?` to make a quantifier lazy (`.*?`). Complexity of a match is roughly O(N) for well-formed patterns but can blow up with nested quantifiers (catastrophic backtracking).

Next: [search vs match vs fullmatch](#regex-search-match), [findall & sub](#regex-findall-sub), [common patterns](#regex-common-patterns).

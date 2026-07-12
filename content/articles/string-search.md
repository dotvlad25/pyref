---
id: string-search
title: Substring Search
keywords: [substring, search, in operator, find, index, rfind, rindex, count, contains, startswith, endswith, membership, locate, first occurrence, last occurrence]
category: Language
type: reference
related: [string-methods, string-split-join, string-basics]
---
# Substring Search

Reach for these to locate or test for a substring. All run in O(n*m) worst case (CPython uses a fast search internally).

## `in` — the membership test

```python
"ell" in "hello"      # True  — cleanest boolean check
"xyz" not in "hello"  # True
```

Use `in` when you only need yes/no. Use `find`/`index` when you need the position.

## find vs index — position of first match

```python
"hello".find("l")     # 2
"hello".find("z")     # -1   — returns -1 on miss (no exception)
"hello".index("l")    # 2
"hello".index("z")    # raises ValueError
```

Prefer [`find`](#string-methods) when a missing substring is expected — no try/except needed.

## rfind / rindex — search from the right

```python
"a/b/c".rfind("/")    # 3    — last occurrence
"a/b/c".rindex("/")   # 3    (raises ValueError on miss)
```

## count — non-overlapping occurrences

```python
"banana".count("a")     # 3
"aaaa".count("aa")      # 2   — non-overlapping! not 3
"".count("")            # 1   — empty-string edge case
```

## Bounded search with start/end

```python
"abcabc".find("a", 1)    # 3   — start searching at index 1
"abcabc".find("c", 0, 3) # 2   — search within [0, 3)
```

For prefix/suffix tests, use `startswith` / `endswith` (see [string methods](#string-methods)) rather than slicing.

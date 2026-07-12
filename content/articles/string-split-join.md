---
id: string-split-join
title: split & join
keywords: [split, join, splitlines, rsplit, maxsplit, partition, rpartition, tokenize, parse, whitespace split, csv, join idiom, delimiter]
category: Language
related: [string-basics, string-methods, string-search, string-translate]
---
# split & join

The most important string pair. `split` tokenizes; `join` rebuilds — both O(n).

```python
"a,b,c".split(",")        # ['a', 'b', 'c']
"hello world  x".split()  # ['hello', 'world', 'x'] — any run of whitespace, no empties
"a,b,c".split(",", 1)     # ['a', 'b,c']  — maxsplit limits the number of splits
```

Note: `"a,,b".split(",")` -> `['a', '', 'b']` (keeps empties), but bare `.split()` drops them.

## rsplit — split from the right

```python
"a.b.c".rsplit(".", 1)    # ['a.b', 'c']  — great for file ext / last token
```

## splitlines — split on line boundaries

```python
"a\nb\r\nc".splitlines()      # ['a', 'b', 'c'] — handles \n, \r\n, \r
"a\nb\n".split("\n")          # ['a', 'b', ''] — trailing empty; splitlines avoids this
```

## partition — split once into 3 parts

```python
"key=val=x".partition("=")    # ('key', '=', 'val=x')  — always a 3-tuple
"no-sep".partition("=")       # ('no-sep', '', '')      — clean "not found" case
```

## The join idiom

`sep.join(iterable_of_strings)` — the O(n) way to build a string (never `+=` in a loop, see [immutability](#string-basics)).

```python
",".join(["a", "b", "c"])     # "a,b,c"
"".join(chars)                # concatenate list of chars
"\n".join(lines)              # rejoin lines
" ".join(str(x) for x in nums)  # ints -> string; items MUST be str
```

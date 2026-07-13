---
id: list-slicing
title: List Slicing
keywords: [slice, slicing, start stop step, negative index, reverse, copy, sublist, stride, step, colon, "seq[::-1]", "seq[:]"]
category: Language
type: reference
related: [list-basics, reversing-sequences, shallow-deep-copy, list-methods, two-pointers]
---
# List Slicing

`seq[start:stop:step]` — Python's most expressive built-in. `stop` is **exclusive**. Master it and you delete dozens of manual loops. Works on any sequence (lists, strings, tuples). Cost: **O(k)** where k is the slice length (it copies).

```python
lst = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

lst[2:5]     # [2, 3, 4]     start:stop (stop exclusive)
lst[:3]      # [0, 1, 2]     omit start -> from 0
lst[-3:]     # [7, 8, 9]     last 3 (negative index from end)
lst[:-1]     # drops last element
```

## Step (stride) and reverse

```python
lst[::2]     # [0, 2, 4, 6, 8]   every other element
lst[1::2]    # [1, 3, 5, 7, 9]   odd indices
lst[::-1]    # [9, 8, ... 0]     reverse the whole sequence
"hello"[::-1]  # "olleh"          strings too

# Palindrome check — the most Pythonic version
def is_palindrome(s):
    return s == s[::-1]
```

## Slicing copies (shallow)

```python
copy = lst[:]        # shallow copy of the whole list (same as lst.copy())
```

`lst[:]` copies the outer list but **shares nested objects** — see [Copy: Shallow vs Deep](#shallow-deep-copy).

## Slice assignment (mutates in place)

```python
a = [1, 2, 3, 4, 5]
a[1:3] = [20, 30, 40]   # [1, 20, 30, 40, 4, 5]  (contiguous: lengths need not match)
a[:] = [9]              # clear + refill, keeps same object/aliases
del a[::2]              # delete every other element
```

Extended (step != 1) slice assignment requires an **equal-length** RHS, else `ValueError`: `a[::2] = [0, 0]` only works if `a[::2]` has exactly 2 elements.

Out-of-range slices never raise: `lst[100:200]` returns `[]`. Full reversal options in [Reversing Sequences](#reversing-sequences).

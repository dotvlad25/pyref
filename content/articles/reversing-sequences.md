---
id: reversing-sequences
title: Reversing Sequences
keywords: [reverse, reversed, slice reverse, in place reverse, "[::-1]", iterator, string reverse, list reverse, backwards, descending]
category: Language
related: [list-slicing, list-methods, list-basics, two-pointers, sorting-key]
---
# Reversing Sequences

Three ways, three purposes: **slice copy**, **lazy iterator**, **in-place mutate**. Pick by whether you need a copy, just to loop, or to modify.

```python
lst = [1, 2, 3, 4]

# 1) Slice — returns a NEW reversed list/string. O(n) time & space.
rev = lst[::-1]            # [4, 3, 2, 1]
"hello"[::-1]              # "olleh"  (works on any sequence)

# 2) reversed() — lazy ITERATOR, O(1) space, no copy. Loop or wrap it.
for x in reversed(lst):    # iterate back-to-front without copying
    print(x)
list(reversed(lst))        # [4, 3, 2, 1]  (materialize if you need a list)

# 3) list.reverse() — IN PLACE, O(1) extra space, returns None.
lst.reverse()              # lst is now [4, 3, 2, 1]; return value is None!
```

## Which to use

```python
# need a reversed copy, keep original      -> lst[::-1]
# just iterate backwards (memory-tight)     -> reversed(lst)
# mutate the original, no copy wanted       -> lst.reverse()
```

## Gotchas

```python
r = lst.reverse()          # r is None — reverse() mutates in place
"abc".reverse()            # AttributeError: strings are immutable; use "abc"[::-1]

# reversed() also works on ranges (no huge list built):
for i in reversed(range(5)):   # 4,3,2,1,0
    ...
```

## In-place, manual (two-pointer) — the classic

```python
def reverse_inplace(a):
    i, j = 0, len(a) - 1
    while i < j:
        a[i], a[j] = a[j], a[i]   # swap ends inward
        i += 1
        j -= 1
```

This is the [two-pointer](#two-pointers) technique. For reversing during a sort, prefer `sort(reverse=True)` — see [sorting with key=](#sorting-key).

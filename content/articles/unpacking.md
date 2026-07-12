---
id: unpacking
title: Tuple Unpacking & Swap
keywords: [unpacking, tuple unpacking, swap, a b = b a, destructuring, multiple assignment, nested unpacking, underscore, ignore value, parallel assignment]
category: Language
related: [star-unpacking, enumerate-zip, two-pointers]
---
# Tuple Unpacking & Swap

Assign multiple variables from a sequence in one line. Cleaner than indexing and signals intent.

```python
a, b, c = [1, 2, 3]   # works for any iterable of matching length
a, b = b, a           # swap without a temp variable
x, y, z = "abc"       # ('a', 'b', 'c')
```

## The swap trick

```python
a, b = b, a
# Python evaluates the ENTIRE right side into a tuple first,
# then binds — so no value is clobbered mid-swap.
```

Idiomatic for reversing, cyclic rotation, and pointer moves in [two pointers](#two-pointers).

## Unpacking in loops

```python
pairs = [(1, "one"), (2, "two"), (3, "three")]
for num, word in pairs:          # unpack each tuple directly
    print(f"{num} = {word}")

# Nested unpacking
for (a, b), c in [((1, 2), 3)]:
    ...                          # a=1, b=2, c=3
```

## Ignore values with `_`

```python
_, important, _ = (1, 42, 3)     # keep only the middle
first, _, third = (1, 2, 3)      # skip the second
```

## Gotcha — length must match

```python
a, b = [1, 2, 3]   # ValueError: too many values to unpack
# Use *rest to absorb the extras -> see [star unpacking](#star-unpacking)
```

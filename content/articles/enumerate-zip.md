---
id: enumerate-zip
title: enumerate & zip
keywords: [enumerate, zip, index and value, parallel iteration, start index, transpose, zip star, strict, dict from zip, pair lists, unzip]
category: Language
type: reference
related: [star-unpacking, unpacking, dict, comprehensions]
---
# enumerate & zip

Kill manual index bookkeeping. `enumerate` gives index+value; `zip` walks sequences in parallel.

## enumerate — index + value

```python
fruits = ["apple", "banana", "cherry"]
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

for i, fruit in enumerate(fruits, start=1):   # 1-based numbering
    print(f"{i}. {fruit}")
```

## zip — parallel iteration

```python
names  = ["Alice", "Bob", "Carol"]
scores = [95, 87, 92]
for name, score in zip(names, scores):
    print(f"{name}: {score}")

d = dict(zip(names, scores))   # build a dict in one line
```

`zip` stops at the shortest input:

```python
list(zip([1, 2, 3], ["a", "b"]))   # [(1, 'a'), (2, 'b')]  <- 3 dropped
```

## strict= (Python 3.10+) — catch length mismatch

```python
list(zip([1, 2], [3], strict=True))   # ValueError: unequal lengths
# Use strict=True when inputs SHOULD be the same length.
```

## Transpose / unzip with `zip(*)`

```python
matrix = [[1, 2, 3], [4, 5, 6]]
list(zip(*matrix))          # [(1, 4), (2, 5), (3, 6)]  transpose

pairs = [(1, "a"), (2, "b")]
nums, letters = zip(*pairs)  # (1, 2), ('a', 'b')  unzip
```

`*` here is [star unpacking](#star-unpacking).

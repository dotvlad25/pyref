---
id: shallow-deep-copy
title: "Copy: Shallow vs Deep"
keywords: [copy, deepcopy, shallow copy, deep copy, aliasing, clone, reference, mutation, backtracking, path copy, copy module, nested]
category: Language
related: [2d-grid, list-slicing, list-basics, dfs, recursion-memoization]
---
# Copy: Shallow vs Deep

Unintended mutation is a common bug. Three levels: **assignment** (alias, same object), **shallow copy** (new outer, shared inner), **deep copy** (fully independent).

```python
a = [1, 2, 3]
b = a              # ALIAS — not a copy! b is a; mutating b mutates a
b.append(4)        # a is now [1,2,3,4] too
```

## Shallow copy — nested objects still shared

```python
import copy

original = [[1, 2], [3, 4]]
shallow = original.copy()      # or original[:], or list(original), or copy.copy()
shallow[0][0] = 99
print(original)   # [[99, 2], [3, 4]]  ← inner list is SHARED!
```

For a **flat** (non-nested) list these are all fine and equivalent:

```python
a = [1, 2, 3]
a.copy();  a[:];  list(a)       # three ways to shallow-copy — pick the clearest
```

## Deep copy — fully independent

```python
deep = copy.deepcopy(original)   # recursively copies every level
deep[0][0] = 0
print(original)   # [[99, 2], [3, 4]]  ← unchanged  ✓
```

`deepcopy` is O(total elements) and handles cycles/shared refs. Reach for it with **grids or nested structures**; skip it for flat lists (slower, unnecessary).

## Common gotcha — backtracking path

```python
def backtrack(path, results):
    if done(path):
        results.append(path[:])   # snapshot! append path[:] or list(path)
        return                    # appending `path` -> all results alias one
                                  #   list that keeps mutating
```

Related: the [2D grid *-trap](#2d-grid) is the same aliasing problem.

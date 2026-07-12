---
id: dict
title: dict (Hash Map)
keywords: [dict, dictionary, hash map, get, setdefault, pop, items, keys, values, update, comprehension, O(1)]
category: Data Structures
type: reference
related: [defaultdict, counter, ordereddict, set]
---
# dict (Hash Map)

Python's `dict` is a hash map with **O(1)** average get/set/delete. Insertion order is guaranteed (Python 3.7+).

```python
d = {"a": 1, "b": 2}

d.get("x")              # None if missing (no KeyError)
d.get("x", 0)          # default value

d.setdefault("c", [])  # insert [] if 'c' missing; return the value either way
d["a"] = 10            # set / overwrite

d.pop("a")             # remove & return; KeyError if missing
d.pop("a", None)       # safe: default if missing

"a" in d               # membership — O(1)
```

## setdefault gotcha (shared mutable)

```python
groups = {}
for name, team in pairs:
    groups.setdefault(team, []).append(name)   # groups values by team
```

Note the returned list is the *same* object stored in the dict — mutating it mutates the dict entry. For this grouping pattern, [`defaultdict`](#) is cleaner.

## Iterating

```python
for k in d: ...             # keys
for k, v in d.items(): ...  # pairs
for v in d.values(): ...    # values
```

## Comprehensions & merging

```python
squares = {n: n * n for n in range(5)}
merged = {**a, **b}         # b wins on key conflicts
a |= b                      # in-place merge (Python 3.9+)
```

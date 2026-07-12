---
id: dict-views
title: Dictionary View Objects
keywords: [dict views, view object, "dict.keys()", "dict.values()", "dict.items()", keys, values, items, dynamic view, dict_keys, dict_values, dict_items, live view, snapshot, set operations]
category: Data Structures
type: reference
related: [dict, set, frozenset, comprehensions, enumerate-zip]
---
# Dictionary View Objects

In Python 3, `keys()`, `values()`, `items()` return **dynamic view objects**, not lists. Views reflect live changes to the dict immediately.

```python
d = {"a": 1}
keys = d.keys()
d["b"] = 2
print(keys)        # dict_keys(['a', 'b'])  <- view updated automatically!

# Need a frozen snapshot? Convert to list (copies at that instant)
static = list(d.keys())   # ['a', 'b']  won't change later
```

Views are iterable and support `len()` and membership (`in`) — all O(1) to create (no copy).

```python
d = {"a": 1, "b": 2}
len(d.keys())            # 2
"a" in d.keys()          # True  (same as "a" in d)
for k, v in d.items():   # unpack tuples directly
    print(k, v)
```

Gotcha: never mutate a dict while iterating its view — raises `RuntimeError: dictionary changed size during iteration`. Snapshot first.

```python
for k in list(d.keys()):   # list() copy makes deletion safe
    if d[k] == 1:
        del d[k]
```

`keys()` and `items()` support **set operations** (they're set-like); `values()` does not (values may be non-hashable / duplicated).

```python
a = {"x": 1, "y": 2}
b = {"y": 9, "z": 3}
a.keys() & b.keys()      # {'y'}  intersection (common keys)
a.keys() | b.keys()      # {'x', 'y', 'z'}  union
a.keys() - b.keys()      # {'x'}  difference
a.items() & b.items()    # set()  compares (key, value) pairs
```

See [dict](#dict), [set](#set), and [frozenset](#frozenset).

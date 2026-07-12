---
id: chainmap
title: collections.ChainMap
keywords: [chainmap, collections, layered lookup, merge dicts, scopes, defaults override, configuration layers, maps, new_child, parents, fallback dict]
category: Standard Library
type: reference
related: [collections-overview, dict, defaultdict]
---
# collections.ChainMap

Groups multiple dicts into **one view** with layered lookup — search the first map, fall back to the next. No copying: it holds references. Reach for it for config layers (CLI > env > defaults) or scope chains.

```python
from collections import ChainMap

defaults = {"color": "red", "size": "M"}
overrides = {"color": "blue"}
cfg = ChainMap(overrides, defaults)   # first map wins

cfg["color"]   # 'blue'  — found in overrides
cfg["size"]    # 'M'     — falls back to defaults
```

## Lookups search left-to-right; writes hit the FIRST map only

```python
cfg["size"] = "L"      # written to overrides (maps[0]), NOT defaults
overrides              # {'color': 'blue', 'size': 'L'}
defaults               # {'color': 'red', 'size': 'M'}  — untouched

del cfg["color"]       # only deletes from maps[0]; KeyError if not there
```

## Scopes: new_child / parents

```python
scope = ChainMap()                 # global scope
scope["x"] = 1
inner = scope.new_child()          # push a nested scope (like a call frame)
inner["x"] = 99                    # shadows outer x
inner["x"]                         # 99
inner.parents["x"]                 # 1  — the enclosing scope
```

`new_child(m)` prepends a new map; `parents` is the chain without the first map. This mirrors how Python itself resolves local -> enclosing -> global names.

## Useful attributes / vs merging

```python
cfg.maps            # [overrides, defaults] — the live underlying list
list(cfg)           # all keys, first-map values winning
dict(cfg)           # flatten into a plain dict snapshot
```

```python
# ChainMap vs {**defaults, **overrides}:
merged = {**defaults, **overrides}   # eager COPY, no back-reference
cfg = ChainMap(overrides, defaults)  # live view; edits to sources show through
```

Lookup is O(number of maps). See the [collections overview](#collections-overview) for siblings.

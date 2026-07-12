---
id: grouping
title: Grouping Items by Key
keywords: [grouping, group by, defaultdict, group items, bucket, partition, setdefault, key function, invert dict, group by size, group anagrams, collect by key]
category: Patterns
related: [defaultdict, dict, counter, groupby, sorting-key]
---
# Grouping Items by Key

Collect items into buckets by a computed key — the single most common use of [`defaultdict(list)`](#defaultdict). O(n) with one pass.

```python
from collections import defaultdict

groups = defaultdict(list)
for item in items:
    groups[key_of(item)].append(item)     # missing key auto-starts as []
```

`defaultdict(list)` removes the "is this key present yet?" check. Without it, use `setdefault`:

```python
groups = {}
for item in items:
    groups.setdefault(key_of(item), []).append(item)   # same effect, plain dict
```

## Examples

```python
# Group files by size (the duplicate-finder's first tier)
by_size = defaultdict(list)
for path in paths:
    by_size[os.path.getsize(path)].append(path)

# Group words as anagrams — sorted letters is the key
anagrams = defaultdict(list)
for w in words:
    anagrams["".join(sorted(w))].append(w)

# Keep only buckets with 2+ members (candidates, duplicates, collisions)
dupes = [g for g in by_size.values() if len(g) >= 2]
```

## Group into other containers

```python
seen = defaultdict(set)          # unique members per key
for u, v in edges:
    seen[u].add(v)               # adjacency set

counts = defaultdict(int)        # count per key (or use Counter)
for x in data:
    counts[category(x)] += 1
```

## defaultdict vs Counter vs itertools.groupby

- **[`defaultdict(list)`](#defaultdict)** — general grouping, any key, input in any order. The default choice.
- **[`Counter`](#counter)** — when you only need *counts* per key, not the items.
- **[`itertools.groupby`](#groupby)** — groups only *consecutive* equal keys, so the input must be **sorted by the key first**. Lazy, but a common trap when the data isn't pre-sorted.

For ordering *within* or *across* groups, pair with [sorting keys](#sorting-key).

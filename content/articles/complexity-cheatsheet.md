---
id: complexity-cheatsheet
title: Time & Space Complexity Cheat Sheet
keywords: [big o, complexity, time complexity, space complexity, cheat sheet, list dict set complexity, deque heapq, amortized, operations cost, performance table]
category: Standard Library
type: reference
related: [list-basics, dict, set, deque, heapq, bisect, collections-overview]
---
# Time & Space Complexity Cheat Sheet

Big-O of the common Python containers and operations. All `dict`/`set` costs are **average**; worst case degrades to O(n) under pathological hash collisions.

## list

```python
# index / append / pop() (end)     O(1)   (append amortized O(1))
# insert(i) / pop(i) / del a[i]     O(n)   shifts elements
# x in a                            O(n)   linear scan
# a[i:j] (slice)                    O(k)   k = slice length
# min / max / sum                   O(n)
# a.sort() / sorted(a)              O(n log n)   Timsort, O(n) aux space
# a.pop(0)                          O(n)   use deque for a queue!
```

## dict / set

```python
# d[k]  d[k]=v  del d[k]  k in d    O(1) average
# set add / discard / x in s        O(1) average
# set union|  intersection&          O(len smaller) .. O(len both)
# iteration                          O(n)
```

## collections.deque

```python
# append / appendleft               O(1)
# pop / popleft                      O(1)   (this is why deque beats list for queues)
# access/insert in the middle       O(n)
```

## heapq (list-backed heap)

```python
# heappush / heappop                O(log n)
# heap[0] (peek min)                O(1)
# heapify(list)                     O(n)
# nlargest(k) / nsmallest(k)        O(n log k)
```

## bisect (on a sorted list)

```python
# bisect_left / bisect_right        O(log n)   binary search
# insort                            O(n)       search is O(log n) but insert shifts O(n)
```

## str

```python
# s[i]  len(s)                      O(1)
# s + t  (concatenation)            O(n+m)   strings are immutable -> new object
# building via += in a loop         O(n^2)   use a list + "".join instead
# sub in s / s.find(sub)            O(n*m) worst
```

## Space notes

- Slicing, comprehensions, and `sorted()` build a **new** container: O(n) extra.
- `list.reverse()` is O(1) aux; `list.sort()` uses O(n) aux (Timsort merge buffer).
- `reversed(seq)` returns a lazy iterator (O(1)); `list(reversed(seq))` or `seq[::-1]` materializes O(n).
- Recursion depth counts as stack space: O(depth).

## Amortized vs worst case

`list.append` and `dict`/`set` inserts are **amortized** O(1) — occasional resize is O(n) but averages out. Hash operations assume good hash distribution; adversarial keys can force O(n) per op.

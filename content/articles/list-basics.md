---
id: list-basics
title: Python Lists (Dynamic Arrays)
keywords: [list, dynamic array, array, append, pop, insert, remove, amortized, big o, complexity, contiguous, resize, index, len]
category: Data Structures
type: reference
related: [list-slicing, list-methods, 2d-grid, array-module, deque, stack]
---
# Python Lists (Dynamic Arrays)

Python's `list` is a **dynamic array**: contiguous references in memory, O(1) indexed access, auto-resizing. Reach for it as your default sequence. The complexity table below summarizes its operations.

```python
nums = [3, 1, 2]

nums[0]            # O(1)  direct memory offset
nums.append(9)     # O(1)  amortized (occasional resize)
nums.pop()         # O(1)  remove LAST element
len(nums)          # O(1)  stored as attribute
```

| Operation        | Time         | Why |
|------------------|--------------|-----|
| `lst[i]`         | O(1)         | offset |
| `lst.append(x)`  | O(1) amortized | rare O(n) resize |
| `lst.pop()`      | O(1)         | remove last |
| `lst.pop(i)`     | O(n)         | shifts elements left |
| `lst.insert(i,x)`| O(n)         | shifts right |
| `lst.remove(x)`  | O(n)         | scan + shift |
| `x in lst`       | O(n)         | linear scan |
| `lst[a:b]`       | O(b-a)       | copies elements |

## Amortized append — why it's O(1)

```python
# The list over-allocates capacity on growth (roughly 1.125x).
# Most appends are free; the rare resize copies all n elements,
# but averaged (amortized) over many appends the cost is O(1).
out = []
for x in range(1000):
    out.append(x)      # do NOT pre-size; append is the idiom
```

## Gotchas

```python
q = [1, 2, 3]
q.pop(0)               # O(n)! never use a list as a FIFO queue
                       # use a collections.deque (popleft is O(1))

x in nums              # O(n) membership — use a set() for O(1) lookups
```

Need O(1) both-ends? [`deque`](#deque). Compact numeric storage? [`array`](#array-module). Slicing details in [List Slicing](#list-slicing).

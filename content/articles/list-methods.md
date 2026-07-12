---
id: list-methods
title: Essential List Methods
keywords: [list methods, sort, sorted, reverse, reversed, index, count, extend, append, remove, pop, insert, clear, in place, returns none]
category: Data Structures
type: reference
related: [list-basics, sorting-key, reversing-sequences, list-slicing, counter]
---
# Essential List Methods

The workhorse list mutators. Key trap: in-place methods return **`None`**, not the list.

```python
nums = [3, 1, 2]

nums.sort()            # in-place, O(n log n) Timsort -> [1, 2, 3]
nums.sort(reverse=True)          # descending
words = ["bb", "a", "ccc"]
words.sort(key=len)              # custom order by length (see sorting-key) -> ['a','bb','ccc']
nums.reverse()         # in-place reverse, O(n)

# GOTCHA: these return None — sort() sorts in place
bad = nums.sort()      # bad is None!
new = sorted(nums)     # use sorted() for a NEW list (works on any iterable)
```

## Search & count

```python
data = [1, 2, 2, 3, 2]
data.index(2)          # 1   first index of value; ValueError if absent  (O(n))
data.index(2, 2)       # 2   search from index 2 (data[2] == 2)
data.count(2)          # 3   occurrences  (O(n))
2 in data              # True  membership  (O(n))
```

## Add & remove

```python
lst = [1, 2, 3]
lst.append(4)          # add one to end,  O(1) amortized -> [1,2,3,4]
lst.extend([5, 6])     # add many (in-place); same as lst += [5,6]
lst.insert(0, 9)       # insert before index 0,  O(n)
lst.remove(2)          # delete FIRST matching value, O(n); ValueError if absent
lst.pop()              # remove & return last,  O(1)
lst.pop(0)             # remove & return index 0,  O(n)
lst.clear()            # empty it in place
```

## append vs extend (the classic mixup)

```python
a = [1, 2]
a.append([3, 4])       # [1, 2, [3, 4]]   nests the list as one element
b = [1, 2]
b.extend([3, 4])       # [1, 2, 3, 4]     unpacks each element
```

Sorting deep-dive: [sorting with key=](#sorting-key). Copying: [Shallow vs Deep](#shallow-deep-copy).

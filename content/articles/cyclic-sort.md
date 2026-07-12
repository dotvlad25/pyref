---
id: cyclic-sort
title: Cyclic Sort
keywords: [cyclic sort, missing number, duplicate number, find all missing, find all duplicates, numbers 1 to n, in place, index as hash, first missing positive, set the swap]
category: Algorithms
type: algo
related: [two-pointers, sorting-key, set, prefix-sum]
---
# Cyclic Sort

Reach for this when the input is **n numbers in a bounded range (0..n or 1..n)** and you must find the missing / duplicate one — in **O(N) time, O(1) space**. Idea: each value has a "home" index, so keep swapping values home until every slot matches.

## The core placement pass — O(N)

```python
def cyclic_sort(nums):               # values are 1..n
    i = 0
    while i < len(nums):
        home = nums[i] - 1           # value v belongs at index v-1
        if nums[i] != nums[home]:    # compare by VALUE, not index (handles dups)
            nums[i], nums[home] = nums[home], nums[i]  # swap into place
        else:
            i += 1                   # already home (or dup) -> advance
    return nums
```

Each swap puts one number home, so total swaps ≤ n → linear despite the nested feel.

## Missing number (0..n) — one value absent

```python
def missing_number(nums):
    i, n = 0, len(nums)
    while i < n:
        home = nums[i]               # range 0..n, so value v -> index v
        if nums[i] < n and nums[i] != nums[home]:
            nums[i], nums[home] = nums[home], nums[i]
        else:
            i += 1
    for idx in range(n):
        if nums[idx] != idx:
            return idx               # first slot that doesn't match
    return n
```

## Find all missing / all duplicates (1..n, len n)

```python
def find_disappeared(nums):          # LC 448
    i = 0
    while i < len(nums):
        home = nums[i] - 1
        if nums[i] != nums[home]:
            nums[i], nums[home] = nums[home], nums[i]
        else:
            i += 1
    return [idx + 1 for idx, v in enumerate(nums) if v != idx + 1]

def find_duplicates(nums):           # LC 442 (same sort, read mismatches)
    i = 0
    while i < len(nums):
        home = nums[i] - 1
        if nums[i] != nums[home]:
            nums[i], nums[home] = nums[home], nums[i]
        else:
            i += 1
    return [v for idx, v in enumerate(nums) if v != idx + 1]
```

Gotcha: loop with `while i < len` and only advance `i` when the current value is already home — swapping otherwise. Compare `nums[i] != nums[home]` (by value) so duplicates don't cause infinite swaps. Alternative when mutation is allowed: sign-marking or [set](#set) for O(N) space.

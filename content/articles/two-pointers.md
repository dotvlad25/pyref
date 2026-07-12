---
id: two-pointers
title: Two Pointers
keywords: [two pointers, opposite ends, fast slow, two sum sorted, palindrome, partition, in place, dutch flag]
category: Patterns
related: [sliding-window, binary-search, sorting-key]
---
# Two Pointers

Use two indices moving through a sequence to solve in **O(N)** what looks like O(N²). Two common flavors: **converging** (ends → middle) and **fast/slow**.

## Converging — two-sum on a sorted array

```python
def two_sum_sorted(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        s = nums[lo] + nums[hi]
        if s == target:
            return [lo, hi]
        elif s < target:
            lo += 1          # need bigger -> move left pointer right
        else:
            hi -= 1          # need smaller -> move right pointer left
    return []
```

## Converging — palindrome check

```python
def is_palindrome(s):
    lo, hi = 0, len(s) - 1
    while lo < hi:
        if s[lo] != s[hi]:
            return False
        lo += 1
        hi -= 1
    return True
```

## Fast/slow — cycle detection (Floyd's)

```python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next          # +1
        fast = fast.next.next     # +2
        if slow is fast:
            return True           # pointers met -> cycle
    return False
```

## In-place — move zeros to the end

```python
def move_zeros(nums):
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
```

When the window size varies with a condition, reach for [sliding window](#) instead.

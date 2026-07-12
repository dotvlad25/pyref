---
id: monotonic-stack
title: Monotonic Stack
keywords: [monotonic stack, next greater element, next smaller element, previous greater, daily temperatures, stock span, largest rectangle histogram, stack of indices]
category: Algorithms
type: pattern
related: [stack, prefix-sum, sliding-window, deque]
---
# Monotonic Stack

Reach for this on **"for each element, find the next/previous greater or smaller"** problems. Brute force is O(N²); a stack keeping elements in sorted order does it in **O(N)** — each index is pushed and popped once.

The trick: when a new value **breaks the invariant** (e.g. exceeds the top), the top has just found its answer — pop it and record.

## Next greater element — O(N)

```python
def next_greater(nums):
    result = [-1] * len(nums)
    stack = []                       # holds indices; values decreasing
    for i, num in enumerate(nums):
        while stack and nums[stack[-1]] < num:
            result[stack.pop()] = num   # num is the next greater for popped idx
        stack.append(i)
    return result
# [2,1,2,4,3] -> [4,2,4,-1,-1]
```

## Daily temperatures — distance to next warmer day

```python
def daily_temperatures(temps):
    res = [0] * len(temps)
    stack = []                       # decreasing temps, store indices
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            res[j] = i - j           # store the gap, not the value
        stack.append(i)
    return res
```

## Variants — flip the comparison / direction

```python
# Next SMALLER element: keep an INCREASING stack -> while stack and nums[stack[-1]] > num
# PREVIOUS greater/smaller: iterate, and BEFORE pushing i, the current top (if any) is the answer for i.
# CIRCULAR array (LC 503): iterate range(2*n) and index with i % n.
```

## Largest rectangle in histogram — classic O(N)

```python
def largest_rectangle(heights):
    stack = []                       # increasing heights, store indices
    best = 0
    for i, h in enumerate(heights + [0]):   # sentinel 0 flushes the stack
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            left = stack[-1] if stack else -1
            best = max(best, height * (i - left - 1))
        stack.append(i)
    return best
```

Store **indices**, not values, when you need distances/widths. See [stack](#stack) for basics.

---
id: sliding-window
title: Sliding Window
keywords: [sliding window, two pointers, subarray, substring, longest, minimum, variable window, fixed window, deque]
category: Patterns
type: pattern
related: [two-pointers, deque, counter]
---
# Sliding Window

Maintain a contiguous window `[left, right]` and slide it, updating an aggregate in **O(1)** per step — turning an O(N²) brute force into **O(N)**.

## Variable window — longest substring without repeats

```python
def longest_unique(s: str) -> int:
    seen = {}                       # char -> last index
    left = best = 0
    for right, ch in enumerate(s):
        if ch in seen and seen[ch] >= left:
            left = seen[ch] + 1     # shrink: jump past the duplicate
        seen[ch] = right
        best = max(best, right - left + 1)
    return best
```

## Fixed window — max sum of size k

```python
def max_sum_k(nums, k):
    window = sum(nums[:k])
    best = window
    for right in range(k, len(nums)):
        window += nums[right] - nums[right - k]   # add new, drop old
        best = max(best, window)
    return best
```

## Shrinkable window — min window meeting a condition

```python
def min_subarray_len(target, nums):
    left = total = 0
    best = float("inf")
    for right, x in enumerate(nums):
        total += x
        while total >= target:            # shrink while condition holds
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return best if best != float("inf") else 0
```

The template: **expand** `right` each step; **shrink** `left` while the window is invalid (or to optimize). See [two pointers](#two-pointers).

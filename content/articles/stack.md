---
id: stack
title: Stack (LIFO)
keywords: [stack, LIFO, push, pop, append, list as stack, monotonic stack, balanced parentheses, call stack]
category: Data Structures
related: [deque, queue-module, dfs, doubly-linked-list]
---
# Stack (LIFO)

In Python, a plain **list is the stack** — `append` and `pop` from the end are both amortized **O(1)**. No special import.

```python
stack = []
stack.append(1)      # push
stack.append(2)
top = stack[-1]      # peek (don't pop) -> 2
x = stack.pop()      # pop -> 2
```

Check emptiness with truthiness: `while stack:`.

## Balanced parentheses (classic)

```python
def is_balanced(s: str) -> bool:
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack
```

## Monotonic stack — next greater element

Keep the stack sorted (here, decreasing) to answer "next greater" in **O(N)** total:

```python
def next_greater(nums):
    res = [-1] * len(nums)
    stack = []                       # holds indices, values decreasing
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            res[stack.pop()] = x     # x is the next greater for that index
        stack.append(i)
    return res
```

For a queue (FIFO) instead, use [`deque`](#) — a list's `pop(0)` is O(N).

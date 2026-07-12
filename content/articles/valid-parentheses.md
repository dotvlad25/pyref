---
id: valid-parentheses
title: "Valid Parentheses (Bracket Matching)"
keywords: [valid parentheses, balanced brackets, bracket matching, matching parentheses, stack, push pop, nested brackets, well formed, expression validation, lifo]
category: Algorithms
type: algo
related: [stack, expression-parsing, monotonic-stack, string-basics, dict]
---
# Valid Parentheses (Bracket Matching)

The canonical stack problem: a string of `()[]{}` is valid iff every closer matches the most recent unmatched opener. Push openers; on a closer, pop and verify it matches.

```python
# Time: O(n), Space: O(n)
def is_valid(s: str) -> bool:
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}   # closer -> expected opener
    for ch in s:
        if ch in pairs:                      # a closing bracket
            # must have a matching opener on top; else invalid
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:                                # an opening bracket
            stack.append(ch)
    return not stack   # leftover openers -> unbalanced
```

Why a stack: brackets nest LIFO, so the only opener a closer can legally match is the top of the stack.

```python
is_valid("([]{})")   # True
is_valid("([)]")     # False  -- correct nesting, wrong interleave
is_valid("(")        # False  -- stack non-empty at end
is_valid(")")        # False  -- pop on empty stack
```

**Two failure modes** to remember:
1. Closer with an empty stack (or wrong top) -> return `False` mid-scan.
2. Openers still on the stack after the loop -> `not stack` catches it.

The stack (a plain `list`, see [stack](#stack)) doubles as the matcher and the balance counter. Same shape generalizes to [expression-parsing](#expression-parsing) and [monotonic-stack](#monotonic-stack).

---
id: expression-parsing
title: Stack-Based Expression Parsing
keywords: [expression parsing, tokenize, tokenizer, evaluate expression, balanced brackets, valid parentheses, calculator, operator precedence, shunting yard, stack, infix, postfix, RPN]
category: Algorithms
related: [stack, regex-basics, regex-findall-sub, trie]
---
# Stack-Based Expression Parsing

Stacks are the standard tool for parsing nested structures — balanced brackets and arithmetic expressions. See [stack](#stack).

## Balanced brackets — O(N) time, O(N) space

```python
def is_valid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}   # closing -> expected opening
    for char in s:
        if char in mapping:
            # Closing: top of stack must be the matching opener
            if not stack or mapping[char] != stack.pop():
                return False
        else:
            stack.append(char)                 # opening -> push
    return len(stack) == 0                      # nothing left unclosed
```

## Tokenize — split text into numbers & operators

```python
import re
def tokenize(expr: str):
    # \d+ for multi-digit numbers; each operator/paren is its own token.
    return re.findall(r"\d+|[+\-*/()]", expr)

tokenize("12 + 3*(4-1)")   # ['12', '+', '3', '*', '(', '4', '-', '1', ')']
```

## Evaluate with operator precedence (two stacks)

```python
def evaluate(expr: str) -> int:
    import operator
    ops = {"+": operator.add, "-": operator.sub,
           "*": operator.mul, "/": operator.floordiv}
    prec = {"+": 1, "-": 1, "*": 2, "/": 2}
    nums, opr = [], []

    def apply():
        b, a = nums.pop(), nums.pop()   # note order: a op b
        nums.append(ops[opr.pop()](a, b))

    for t in tokenize(expr):
        if t.isdigit():
            nums.append(int(t))
        elif t == "(":
            opr.append(t)
        elif t == ")":
            while opr[-1] != "(":
                apply()
            opr.pop()                    # discard "("
        else:                            # operator
            # apply higher/equal precedence ops already on the stack first
            while opr and opr[-1] != "(" and prec[opr[-1]] >= prec[t]:
                apply()
            opr.append(t)
    while opr:
        apply()
    return nums[0]

evaluate("12 + 3*(4-1)")   # 21
```

Time O(N): each token is pushed/popped at most once. This is the shunting-yard idea. For left-associative `-`/`/`, `>=` precedence is what keeps evaluation left-to-right.

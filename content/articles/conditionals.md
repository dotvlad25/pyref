---
id: conditionals
title: "Conditionals: if / elif / else"
keywords: [if, elif, else, if else, else if, conditional, branch, branching, switch, no switch, match, colon, indentation, block, ternary, control flow]
category: Language
type: reference
related: [loops, truthiness, ternary-expression, chained-comparisons, exception-handling]
---
# Conditionals: if / elif / else

```python
# Every block header ends with ':' and indentation (4 spaces) defines the block.
# There are NO curly braces. A wrong indent is a SyntaxError, not a style nit.
if True:
    print("inside the if")   # indented = part of the block
print("outside the if")      # not indented = always runs
```

Use `if`, `elif` (not `else if`), and `else`. First truthy branch wins; the rest are skipped.

```python
x = 42
if x > 100:
    print("large")
elif x > 10:
    print("medium")   # this branch executes; later branches skipped
else:
    print("small")
```

Python has **no `switch` statement** — chain `elif` for multi-branch logic. (Python 3.10+ adds structural `match`/`case` for pattern matching, but `elif` chains cover ordinary value branching.)

```python
# Idiomatic multi-branch dispatch: elif chain, or a dict lookup
op = "+"
if   op == "+": r = a + b
elif op == "-": r = a - b
else:           raise ValueError(op)

# Dict-as-switch (O(1) lookup) when branches map value -> action:
r = {"+": a + b, "-": a - b}[op]
```

Conditions use [truthiness](#truthiness): empty containers, `0`, `None`, `""` are falsy — no need for `len(x) > 0`.

```python
items = []
if items:           # falsy when empty; avoid `if len(items) > 0`
    process(items)
if x is None:       # identity check for None, not `== None`
    ...
```

For a one-line value choice, use the [ternary](#ternary-expression) — condition sits in the *middle*:

```python
abs_val = x if x >= 0 else -x   # value_if_true IF cond ELSE fallback
```

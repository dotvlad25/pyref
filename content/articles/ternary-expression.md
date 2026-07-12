---
id: ternary-expression
title: Ternary / Conditional Expression
keywords: [ternary, conditional expression, inline if else, x if cond else y, nested ternary, one line if, default value, guard]
category: Language
type: reference
related: [comprehensions, chained-comparisons, min-max-any-all]
---
# Ternary / Conditional Expression

Pick a value inline: `value_if_true if condition else value_if_false`. Reach for it when a full `if` block is overkill.

```python
status = "even" if x % 2 == 0 else "odd"
sign   = 1 if x > 0 else -1
```

## Common patterns

```python
# Default when empty/None
name = user.name if user else "guest"

# Clamp / guard against division by zero
avg = total / n if n else 0

# Inside a comprehension (value slot)
labels = ["hi" if x > 0 else "lo" for x in nums]
```

## Nested (chain right-to-left)

```python
grade = "A" if s >= 90 else "B" if s >= 80 else "C"
# reads as: A if s>=90 else (B if s>=80 else C)
# Keep to 2-3 levels — beyond that, use a dict or if/elif.
```

## Gotchas

```python
# It's an EXPRESSION (returns a value), not a statement:
y = (a if cond else b)          # ok
# Don't confuse order with C's cond ? a : b — condition is in the MIDDLE.

# Falsy default trap: 0 or "" would be replaced by 'or'
x = val or 10        # 10 even if val == 0  !
x = val if val is not None else 10   # safer
```

Combine with [chained comparisons](#chained-comparisons) and [comprehensions](#comprehensions).

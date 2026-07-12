---
id: chained-comparisons
title: Chained Comparisons
keywords: [chained comparison, range check, 0 <= x < n, a == b == c, bounds check, between, comparison operators, in bounds, left to right]
category: Language
related: [ternary-expression, min-max-any-all, binary-search]
---
# Chained Comparisons

Python chains comparison operators the way math does — reads naturally, no `and` needed.

```python
x = 5
1 < x < 10       # True    (same as 1 < x and x < 10)
0 <= x <= 100    # True
1 < x < 3        # False
```

## Bounds check

```python
# In-grid check without four separate conditions
if 0 <= r < rows and 0 <= c < cols:
    visit(r, c)
```

## Equality chains

```python
a = b = c = 1
a == b == c      # True   (all equal)
```

## How it works

```python
# a < b < c  evaluates b ONCE and is equivalent to:
#   (a < b) and (b < c)
# Any operators mix and short-circuit left to right.
1 < 2 > 0 == 0   # True
```

## Gotcha — don't chain unrelated logic

```python
# Confusing / rarely what you want:
a == b == c   # NOT (a == b) == c ; it's a==b and b==c
```

Related: [ternary expression](#ternary-expression), used often in [binary search](#binary-search) bounds.

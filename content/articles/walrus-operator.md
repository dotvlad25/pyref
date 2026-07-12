---
id: walrus-operator
title: Walrus Operator :=
keywords: [walrus operator, assignment expression, colon equals, while loop, comprehension filter, inline assignment, named expression, avoid double call]
category: Language
related: [comprehensions, generator-expressions, sliding-window]
---
# Walrus Operator :=

Assigns a value *as part of an expression* (Python 3.8+). Reach for it to assign and test in one shot.

## Streaming while-loop

```python
# Without walrus: read, check, use — three lines, repeated read
while True:
    line = file.readline()
    if not line:
        break
    process(line)

# With walrus: assign and test together
while (line := file.readline()):
    process(line)
```

## Avoid computing twice in a comprehension

```python
# f(x) called TWICE per item:
results = [f(x) for x in data if f(x) > 0]

# f(x) called once, result reused:
results = [y for x in data if (y := f(x)) > 0]
```

## Other handy spots

```python
if (n := len(data)) > 10:        # capture + compare
    print(f"too long: {n}")

# Sliding-window / running state without a separate line
```

## Gotchas

```python
x = (y := 5)     # parens often required in assignments/args
# Skip it when it hurts readability — clarity beats cleverness.
```

Pairs well with [comprehensions](#comprehensions) and [sliding window](#sliding-window).

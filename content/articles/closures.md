---
id: closures
title: Closures & Late Binding
keywords: [closure, late binding, captured variable, free variable, cell, loop closure bug, default argument capture, __closure__, nonlocal]
category: Language
type: concept
related: [nested-functions, global-nonlocal, default-args-gotcha, lambda]
---
# Closures & Late Binding

A **closure** is an inner function that remembers variables from the enclosing scope, even after the outer function has returned. Read access is automatic.

```python
def make_counter(start):
    def show():
        return start          # 'start' is captured (a free variable)
    return show

f = make_counter(5)
f()                           # 5  — 'start' lives on after make_counter returns
```

## The late-binding gotcha

Closures capture the **variable**, not its value at definition time. In a loop, every closure sees the *final* value.

```python
funcs = [lambda: i for i in range(3)]
[f() for f in funcs]          # [2, 2, 2]  — NOT [0, 1, 2]!
# each lambda looks up i when CALLED, by which point i == 2
```

## Fix: bind the value with a default argument

Default args are evaluated at definition time, freezing the current value per iteration.

```python
funcs = [lambda i=i: i for i in range(3)]
[f() for f in funcs]          # [0, 1, 2]  ✓
```

Same fix for nested defs:

```python
def make_multipliers():
    out = []
    for n in range(1, 4):
        out.append(lambda x, n=n: x * n)   # n=n freezes each n
    return out

[m(10) for m in make_multipliers()]        # [10, 20, 30]
```

## Writing to a captured variable needs nonlocal

Reading is free; *rebinding* a captured name requires [`nonlocal`](#global-nonlocal), or you get `UnboundLocalError`.

```python
def counter():
    count = 0
    def inc():
        nonlocal count        # without this: assignment makes a NEW local
        count += 1
        return count
    return inc
```

Note: this default-arg trick is unrelated to the [mutable default argument bug](#default-args-gotcha) — that one is about *sharing* one object, this one about *capturing* a value.

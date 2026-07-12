---
id: global-nonlocal
title: global & nonlocal
keywords: [global, nonlocal, scope, rebind, UnboundLocalError, module scope, enclosing scope, LEGB, closure counter, mutate outer variable]
category: Language
type: reference
related: [closures, nested-functions, dfs]
---
# global & nonlocal

By default, **assigning** to a name inside a function creates a new *local*. `global` and `nonlocal` let you instead *rebind* a name in an outer scope. You only need them to assign — reading outer variables works without either.

## The trap: UnboundLocalError

```python
count = 0
def bump():
    count += 1        # UnboundLocalError! assignment makes 'count' local,
                      # so the read on the RHS sees an undefined local
```

## nonlocal — rebind the nearest enclosing function's variable

A common case: a nested helper that mutates an outer counter.

```python
def count_nodes(root):
    count = 0
    def dfs(node):
        nonlocal count        # required to modify the outer variable
        if not node:
            return
        count += 1            # without nonlocal -> UnboundLocalError
        dfs(node.left)
        dfs(node.right)
    dfs(root)
    return count
```

## global — rebind a module-level variable

```python
total = 0
def add(n):
    global total
    total += n

add(5); add(3)
total                         # 8
```

## When you DON'T need them

```python
def f():
    print(count)             # reading outer/global: fine, no declaration

def g():
    data.append(1)           # MUTATING an object: fine — no rebinding happens
    d["k"] = 1               # same — you're not reassigning the name
```

Rule of thumb: need it only when a nested/inner function **reassigns** (`=`, `+=`, etc.) an outer name. Mutating a list/dict in place needs nothing. Prefer `nonlocal` closures over `global` — module globals hurt testability. See [closures](#closures) and [nested-functions](#nested-functions).

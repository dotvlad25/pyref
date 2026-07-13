---
id: loops
title: "Loops: for, while, and range"
keywords: [for, while, range, loop, iterate, break, continue, do while, do-while, while true, for else, increment, i++, "i += 1", enumerate, control flow]
category: Language
type: reference
related: [conditionals, iterables, enumerate-zip, comprehensions, next-builtin]
---
# Loops: for, while, and range

`for` iterates directly over any [iterable](#iterables) — no index bookkeeping. `range(n)` yields `0..n-1`.

```python
for i in range(5):          # 0, 1, 2, 3, 4
    print(i)

for fruit in ["a", "b"]:    # iterate values directly, no index
    print(fruit)

# range(start, stop, step) — stop is exclusive; step can be negative
for i in range(2, 10, 2):   # 2, 4, 6, 8
    ...
for i in range(5, 0, -1):   # 5, 4, 3, 2, 1
    ...
```

`while` loops while the condition is truthy. **No `i++`** in Python — use `i += 1`.

```python
n = 10
while n > 0:
    n -= 2          # no ++ / -- operators; use += / -=
print(n)            # 0
```

`break` exits the loop; `continue` skips to the next iteration.

```python
for x in nums:
    if x < 0: continue     # skip negatives
    if x == target: break  # stop early
```

**No `do-while`** — the idiomatic replacement is `while True:` with an explicit `break`:

```python
while True:
    result = step()
    if result >= 5:
        break          # run body at least once, then test
```

`for`/`while` support an `else` clause that runs only if the loop finished **without** `break` — handy for search loops:

```python
for x in nums:
    if x == target:
        break
else:                  # runs only if no break happened
    print("not found")
```

Need the index? Use [enumerate](#enumerate-zip), not `range(len(...))`:

```python
for i, val in enumerate(nums, start=1):
    ...
```

---
id: pass-by-object-reference
title: Pass by Object Reference (Call by Object Sharing)
keywords: [pass by object reference, call by object sharing, pass by assignment, pass by reference, pass by value, mutate in place, rebind, slice assignment, "lst[:]", mutable argument, immutable argument, function arguments, aliasing]
category: Language
related: [is-vs-equals, default-args-gotcha, shallow-deep-copy, string-immutability, list-slicing]
---
# Pass by Object Reference (Call by Object Sharing)

Python passes **the object reference by value**. The name inside the function is a new local binding to the *same* object. So:

- **Mutate** the object in place -> caller sees it.
- **Rebind** the local name -> caller does *not* see it.

```python
def modify(lst):
    lst.append(4)      # MUTATES the shared object -> caller sees [0, 4]
    lst = [1, 2, 3]    # REBINDS local name only; caller unaffected

my_list = [0]
modify(my_list)
print(my_list)         # [0, 4]  (append stuck; reassignment did not)
```

## Rebind vs mutate in place

```python
def rebind(x):    x = x + [99]     # new list -> local only
def mutate(x):    x += [99]        # list.__iadd__ = in-place extend -> caller sees it!
a = [1]; rebind(a); print(a)       # [1]
b = [1]; mutate(b); print(b)       # [1, 99]   (+=  differs from  = x + ...)
```

## Slice assignment: replace contents in place

To make the caller see a full replacement, mutate through the *existing* object:

```python
def replace(lst):
    lst[:] = [1, 2, 3]   # slice assign REWRITES contents of same object
xs = [9, 9]
replace(xs)
print(xs)                # [1, 2, 3]   (would be [9, 9] with `lst = [1,2,3]`)
```

## Immutable types behave like pass-by-value

`int, str, float, tuple, frozenset` can't be mutated, so any "change" makes a new object and rebinds locally:

```python
def bump(n): n += 1          # new int; caller's value unchanged
k = 5; bump(k); print(k)     # 5
```

## Takeaway

```python
# see change in caller:   lst.append(x) / lst[:] = ... / d[k] = v   (mutate)
# do NOT see change:      lst = [...]   / n = n + 1                  (rebind)
```

This is why [mutable default args](#default-args-gotcha) leak, and why you [copy](#shallow-deep-copy) before mutating shared data. Related: [aliasing & is](#is-vs-equals), [string immutability](#string-immutability).

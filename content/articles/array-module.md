---
id: array-module
title: array module
keywords: [array, array module, typed array, compact array, typecode, memory, buffer, numeric, bytes, fromlist, tobytes, list vs array]
category: Standard Library
related: [list-basics, list-methods, list-slicing]
---
# array module

`array.array` stores **homogeneous** numeric values in a compact C buffer — far less memory than a `list` (which stores boxed Python objects + pointers). Reach for it only when memory matters for large numeric sequences; otherwise a plain [`list`](#list-basics) is more flexible.

```python
from array import array

a = array('i', [1, 2, 3])   # 'i' = signed int; first arg is the typecode
a.append(4)                 # like a list, but only accepts ints
a[0] = 10
len(a); a[1:3]              # indexing & slicing work like lists
```

## Common typecodes

```python
# 'b'/'B'  signed/unsigned char (1 byte)
# 'i'/'I'  signed/unsigned int
# 'l'/'L'  signed/unsigned long
# 'q'/'Q'  signed/unsigned long long (8 bytes)
# 'f'      float (4 bytes)     'd'  double (8 bytes)
d = array('d', [1.5, 2.5])
# Wrong type raises immediately:
array('i', [1.5])           # TypeError: 'float' object cannot be interpreted as an integer
```

## list interop & bytes

```python
a.tolist()                  # -> [10, 2, 3, 4]  back to a plain list
a.fromlist([5, 6])          # bulk-append from a list
raw = a.tobytes()           # raw C buffer as bytes
b = array('i'); b.frombytes(raw)
```

## array vs list

```python
# list:  heterogeneous, stores object references, more memory, richer methods
# array: single numeric type, compact contiguous storage, C-speed bulk ops
```

Rule of thumb: you rarely need `array` — reach for it for memory-constrained numeric data. For real numeric/math work, most codebases use NumPy instead. Everyday sequences: use a [list](#list-basics).

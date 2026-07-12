---
id: integer-arithmetic
title: Integer Arithmetic
keywords: [integer, arithmetic, divmod, floor division, modulo, remainder, pow, modular exponentiation, big int, arbitrary precision, overflow, negative modulo]
category: Language
type: reference
related: [math-module, bit-manipulation, number-bases, bit-tricks]
---
# Integer Arithmetic

Python ints are **arbitrary precision** — they never overflow. `2 ** 1000` just works, eliminating a whole class of C++/Java bugs.

```python
# Floor division floors toward -inf (differs from C++/Java!)
7 // 2      # 3
-7 // 2     # -4   (C++ truncates toward 0 -> -3)
int(-7 / 2) # -3   (emulate C++ truncation)

# Modulo takes the sign of the DIVISOR in Python
-7 % 3      # 2    (always non-negative for positive divisor; C++ gives -1)
7 % -3      # -2
```

`divmod` returns quotient and remainder together — handy for digit extraction and grid math:

```python
divmod(17, 5)        # (3, 2)  == (17 // 5, 17 % 5)
q, r = divmod(17, 5)

# split index into 2D coords
row, col = divmod(idx, num_cols)

# extract digits right to left
n, digits = 1234, []
while n:
    n, d = divmod(n, 10)
    digits.append(d)     # [4, 3, 2, 1]
```

## Powers and modular exponentiation

```python
2 ** 10             # 1024
pow(2, 10)          # 1024
pow(2, 10, 1000)    # 24  — (2**10) % 1000 in O(log n), no huge intermediate
pow(3, -1, 7)       # 5   — modular inverse (3.8+): (3*5) % 7 == 1
```

Use `pow(a, b, mod)` for competitive/crypto-style problems and the common `10**9 + 7` modulus. Big-int math is exact but slower than fixed-width — cost grows with digit count. See [math module](#math-module) for `gcd`, `isqrt`, `comb`, and [bit manipulation](#bit-manipulation) for bitwise ops.

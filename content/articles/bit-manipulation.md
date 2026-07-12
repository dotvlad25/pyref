---
id: bit-manipulation
title: Bit Manipulation Basics
keywords: [bit manipulation, bitwise, AND, OR, XOR, NOT, shift, left shift, right shift, mask, set bit, clear bit, toggle bit, get bit, binary]
category: Language
type: reference
related: [bit-tricks, number-bases, integer-arithmetic, math-module]
---
# Bit Manipulation Basics

Python's bitwise operators match C++/Java — but ints are arbitrary precision, so there's **no 32-bit overflow** to fight.

```python
n = 0b1010          # 10

n & 0b1100          # 8   AND  — keep bits set in both
n | 0b0101          # 15  OR   — set bits from either
n ^ 0b1100          # 6   XOR  — flip where bits differ
~n                  # -11 NOT  — bitwise complement (~x == -x-1)
n << 1              # 20  left shift  == multiply by 2
n >> 1              # 5   right shift == floor-divide by 2
```

## Single-bit operations (i = bit index, 0 = LSB)

```python
def get_bit(n, i):    return (n >> i) & 1      # read bit i -> 0 or 1
def set_bit(n, i):    return n | (1 << i)      # force bit i to 1
def clear_bit(n, i):  return n & ~(1 << i)     # force bit i to 0
def toggle_bit(n, i): return n ^ (1 << i)      # flip bit i
```

## Masks

```python
(1 << k) - 1                 # mask of the low k bits: k=4 -> 0b1111
x & ((1 << 8) - 1)           # keep low 8 bits (x mod 256)
x & 0xFF                     # same, as a hex literal
x & 1                        # odd/even test (1 == odd)
```

XOR is the workhorse: `x ^ x == 0` and `x ^ 0 == x`, so pairs cancel.

```python
# find the single unpaired number — O(n) time, O(1) space
def single_number(nums):
    result = 0
    for x in nums:
        result ^= x
    return result
```

All ops are O(1) for word-sized ints (O(word count) for big ints). See [common bit tricks](#bit-tricks) and [number bases](#number-bases) for `bin`/`hex`.

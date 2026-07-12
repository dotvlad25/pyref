---
id: bit-tricks
title: Common Bit Tricks
keywords: [bit tricks, lowest set bit, x&-x, x&(x-1), Brian Kernighan, count set bits, popcount, bit_count, power of two, clear lowest bit, isolate bit, hamming weight]
category: Algorithms
related: [bit-manipulation, number-bases, integer-arithmetic, math-module]
---
# Common Bit Tricks

A handful of common one-liners worth knowing.

```python
x & -x            # isolate the LOWEST set bit  (12=0b1100 -> 4=0b100)
x & (x - 1)       # CLEAR the lowest set bit    (12 -> 8=0b1000)
```

## Power of two

`x & (x - 1) == 0` means at most one bit is set:

```python
def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0
```

## Count set bits (population count / Hamming weight)

```python
# Python 3.10+: built-in, fastest
n.bit_count()            # e.g. (0b1011).bit_count() == 3
bin(n).count('1')        # portable one-liner

# Brian Kernighan's algorithm — O(k), k = number of set bits
def count_set_bits(n):
    count = 0
    while n:
        n &= n - 1       # drop the lowest set bit each pass
        count += 1
    return count
```

## More handy identities

```python
n.bit_length()               # bits needed for n (floor(log2 n)+1); (0).bit_length()==0
x ^ y                        # differing bits of x and y
(x ^ y).bit_count()          # Hamming distance between x and y
x & (x + 1) == 0             # x is all 1-bits (0b111...)
```

XOR of `0..n` follows a period-4 pattern — lets you find a missing number in O(1) extra space. See [bit manipulation basics](#bit-manipulation) for masks/shifts and [number bases](#number-bases) for binary formatting. Common on LeetCode #191, #231, #136, #268.

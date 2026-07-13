---
id: number-bases
title: Number Bases
keywords: [number bases, binary, hexadecimal, octal, bin, hex, oct, int base, base conversion, format, radix, parse binary, 0x, 0b, 0o]
category: Language
type: reference
related: [bit-manipulation, bit-tricks, integer-arithmetic, math-module]
---
# Number Bases

Convert ints to base-prefixed strings and parse them back.

```python
# int -> string (with 0b/0o/0x prefix)
bin(10)     # '0b1010'
oct(10)     # '0o12'
hex(255)    # '0xff'

# literals in source
0b1010, 0o12, 0xff      # (10, 10, 255)
1_000_000               # underscores allowed for readability
```

## Parsing: int(str, base)

```python
int("1010", 2)      # 10
int("ff", 16)       # 255
int("0xff", 16)     # 255  — prefix is OK when base is explicit
int("0b1010", 0)    # 10   — base=0 -> infer from the prefix
int("777", 8)       # 511
# int("2", 2)       -> ValueError: invalid digit for base 2
```

## Clean formatting (no prefix, padding)

```python
format(10, 'b')       # '1010'
format(255, 'x')      # 'ff'   ('X' -> 'FF')
format(10, 'o')       # '12'
format(10, '08b')     # '00001010'  — zero-pad to width 8
f"{255:#x}"           # '0xff'  — '#' adds the prefix
f"{5:04b}"            # '0101'
```

## Arbitrary base out (no built-in — roll your own)

```python
def to_base(n, b):        # n >= 0, 2 <= b <= 36; negatives loop forever
    if n == 0:
        return "0"
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    out = []
    while n:
        n, r = divmod(n, b)      # see integer-arithmetic
        out.append(digits[r])
    return "".join(reversed(out))

to_base(255, 16)     # 'ff'
```

`bin()`/`hex()`/`oct()` keep the prefix; `format()`/f-strings give you clean, padded output. See [integer arithmetic](#integer-arithmetic) and [bit manipulation](#bit-manipulation).

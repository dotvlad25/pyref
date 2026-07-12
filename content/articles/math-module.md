---
id: math-module
title: math module
keywords: [math, gcd, lcm, isqrt, sqrt, comb, perm, factorial, inf, nan, ceil, floor, prod, log, log2, pi, infinity, combinations, binomial]
category: Standard Library
type: reference
related: [integer-arithmetic, random-module, bit-tricks, number-bases]
---
# math module

Number theory and combinatorics with no overflow — the right tools for exact integer math.

```python
import math

math.gcd(12, 8)      # 4    (accepts many args: gcd(12, 8, 20) -> 4)
math.lcm(4, 6)       # 12   (3.9+)
math.isqrt(17)       # 4    exact integer sqrt — NO float error
math.sqrt(16)        # 4.0  float; avoid for perfect-square tests
math.factorial(5)    # 120
math.comb(10, 3)     # 120  n-choose-k, arbitrary precision (3.8+)
math.perm(10, 3)     # 720  (3.8+)
math.prod([1,2,3,4]) # 24   product of an iterable (3.8+)
```

## Rounding (return ints)

```python
math.ceil(3.2)       # 4    toward +inf
math.floor(3.8)      # 3    toward -inf (matches // )
math.trunc(-3.8)     # -3   toward zero
round(2.5)           # 2    banker's rounding — NOT math!
```

## Infinity and NaN — sentinels for min/max trackers

```python
INF = math.inf              # == float('inf'); use to init "best so far"
best = math.inf
best = min(best, 5)         # 5

math.isinf(INF)             # True
math.isnan(float('nan'))    # True  — nan != nan, so test with this
math.inf > 10**18           # True
```

## Logs and constants

```python
math.log2(1024)      # 10.0
math.log(8, 2)       # 3.0   log base 2
math.log10(1000)     # 3.0
math.pi, math.e, math.tau
```

Gotcha: use `math.isqrt(n)` (exact) not `int(math.sqrt(n))` (float, off-by-one at large n) for perfect-square checks. See [integer arithmetic](#integer-arithmetic) for `pow`/`divmod` and [random module](#random-module) for randomness.

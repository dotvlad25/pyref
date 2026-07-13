---
id: functools-reduce
title: functools.reduce
keywords: [functools, reduce, fold, foldl, accumulate, initializer, aggregate, running total, left fold]
category: Standard Library
type: reference
related: [accumulate, functools-cache, functools-partial, math-module, sorting-key]
---
# functools.reduce

Fold a sequence into a single value by applying a two-argument function left to right. Reach for it when there's no built-in (`sum`, `max`, `math.prod`) that already does the job.

```python
from functools import reduce

# reduce(f, [a,b,c,d]) == f(f(f(a, b), c), d)  — fold left
product = reduce(lambda a, b: a * b, [1, 2, 3, 4, 5])   # 120
```

Pass an **initializer** as the 3rd arg — it seeds the accumulator and makes empty input safe:

```python
reduce(lambda a, b: a + b, [], 0)        # 0  (no ValueError)
reduce(lambda a, b: a * b, [])           # TypeError: reduce() of empty iterable with no initial value
reduce(lambda acc, x: acc | {x}, nums, set())   # build a set
```

The accumulator type can differ from the elements (init controls it):

```python
# flatten list of lists
reduce(lambda acc, xs: acc + xs, [[1, 2], [3], [4, 5]], [])   # [1,2,3,4,5]
```

## When to avoid

```python
sum(nums)                 # not reduce(add, nums)
max(nums); min(nums)
import math; math.prod(nums)      # 3.8+, not reduce(mul, ...)
"".join(words)            # not reduce(str.__add__, ...) — O(n^2)!
```

Prefer an explicit loop or a comprehension when the lambda gets hard to read — clarity beats cleverness. For a running list of partial results instead of one value, use [itertools.accumulate](#accumulate). Complexity: O(n) calls.

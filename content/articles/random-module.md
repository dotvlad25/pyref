---
id: random-module
title: random module
keywords: [random, randint, randrange, random, uniform, choice, choices, shuffle, sample, seed, weights, reproducible, pick random, secrets]
category: Standard Library
type: reference
related: [math-module, integer-arithmetic]
---
# random module

Pseudo-random values. Reach for it to generate test data, pick elements, or shuffle.

```python
import random

random.random()          # float in [0.0, 1.0)
random.uniform(1, 10)    # float in [1, 10]
random.randint(1, 6)     # int in [1, 6]   INCLUSIVE both ends
random.randrange(6)      # int in [0, 6)   like range: 0..5
random.randrange(0, 10, 2)   # even int in [0, 10)
```

## Picking from a sequence

```python
nums = [10, 20, 30, 40]
random.choice(nums)              # one element (error if empty)
random.choices(nums, k=3)        # k picks WITH replacement -> [20,20,40]
random.choices(nums, weights=[1, 1, 1, 7], k=5)   # weighted
random.sample(nums, k=2)         # k UNIQUE picks, no replacement -> [30,10]
```

## Shuffle (in place)

```python
random.shuffle(nums)     # modifies nums, returns None
# for a copy: random.sample(nums, len(nums))  OR  sorted(nums, key=lambda _: random.random())
```

## Reproducibility

```python
random.seed(42)          # fixed seed -> deterministic sequence (great for tests)
random.seed()            # reseed from OS entropy / time

r = random.Random(42)    # independent generator instance
r.randint(1, 100)
```

Gotchas:
- `randint(a, b)` is inclusive of `b`; `randrange(b)` is exclusive — a classic off-by-one.
- `shuffle` returns `None` (in place) — don't write `x = random.shuffle(x)`.
- Not cryptographically secure. For tokens/passwords use the `secrets` module.

See [math module](#math-module) for deterministic math.

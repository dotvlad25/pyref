---
id: fstrings
title: f-strings
keywords: [f-string, format, string formatting, format spec, debug equals, alignment, padding, precision, thousands separator, zero pad, fill, width, repr]
category: Language
related: [ternary-expression, enumerate-zip, comprehensions]
---
# f-strings

Interpolate expressions directly in string literals (Python 3.6+). Prefix with `f`; put code in `{}`.

```python
name, age = "Ada", 36
f"{name} is {age}"          # 'Ada is 36'
f"{age * 2}"                # expressions allowed -> '72'
f"{'A' if age > 18 else 'M'}"   # ternary inside
```

## Format spec — `{value:spec}`

```python
pi = 3.14159
f"{pi:.2f}"        # '3.14'    fixed precision
f"{1000000:,}"     # '1,000,000'   thousands separator
f"{255:x}"         # 'ff'      hex   (b=bin, o=oct)
f"{0.25:.1%}"      # '25.0%'   percent
```

## Alignment & padding — `:[fill][align][width]`

```python
f"{'hi':>8}"       # '      hi'   right-align, width 8
f"{'hi':<8}|"      # 'hi      |'  left-align
f"{'hi':^8}"       # '   hi   '   center
f"{'hi':*^8}"      # '***hi***'   custom fill char
f"{42:05d}"        # '00042'      zero-pad numbers
f"{42:>5}"         # '   42'
```

## `=` debug (Python 3.8+)

```python
x = 7
f"{x=}"            # 'x=7'   prints expr text AND value
f"{x*2=}"          # 'x*2=14'   great for quick debugging
```

## Nested / dynamic spec & repr

```python
w = 10
f"{'hi':>{w}}"     # width from a variable
f"{name!r}"        # 'Ada'  -> uses repr() (adds quotes)
```

## Gotcha

```python
f"{{literal braces}}"   # double braces to emit { }
```

Pairs with [ternary](#ternary-expression) for inline choices.

---
id: string-formatting
title: String Formatting
keywords: [format, f-string, fstring, percent formatting, str.format, format spec, padding, alignment, precision, thousands separator, repr, hex, binary, zero pad, rounding]
category: Language
type: reference
related: [string-methods, string-basics, ascii-ord-chr]
---
# String Formatting

Prefer **f-strings** (Python 3.6+) — fastest and most readable. `%` and `.format()` still show up in legacy code.

```python
name, count = "Alice", 5
f"User {name} has {count} items."      # f-string (preferred)
"User {} has {} items.".format(name, count)
"User %s has %d items." % (name, count)   # old %-style
```

## Format spec: `{value:[fill][align][width][,][.prec][type]}`

```python
f"{42:5d}"       # "   42"   width 5, right-aligned
f"{42:<5d}"      # "42   "   left align
f"{42:^5d}"      # " 42  "   center
f"{42:05d}"      # "00042"   zero-pad
f"{7:+d}"        # "+7"      force sign
```

## Floats & numbers

```python
f"{3.14159:.2f}"     # "3.14"     fixed 2 decimals
f"{0.5:.1%}"         # "50.0%"    percent
f"{1234567:,}"       # "1,234,567" thousands separator
f"{255:x}"           # "ff"       hex   (b=bin, o=oct)
f"{255:#x}"          # "0xff"     with prefix
```

## Handy f-string tricks

```python
x, width = 42, 8
f"{x=}"              # "x=42"     debug (3.8+) — prints name and value
f"{name!r}"          # "'Alice'"  repr instead of str
f"{count:>{width}}"  # nested field: width comes from a variable
```

Combine with [str methods](#string-methods) and [`ord`/`chr`](#ascii-ord-chr) for output-heavy problems.

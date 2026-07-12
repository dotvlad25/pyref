---
id: ascii-ord-chr
title: ord, chr & ASCII
keywords: [ord, chr, ascii, unicode code point, char to int, int to char, frequency array, a-z index, alphabet, caesar cipher, shift, digit to int, count array]
category: Language
related: [string-basics, string-methods, counter, string-formatting]
---
# ord, chr & ASCII

`ord(c)` gives the integer code point of a character; `chr(n)` reverses it. The foundation of frequency arrays and cipher problems.

```python
ord('a')    # 97
ord('A')    # 65
ord('0')    # 48
chr(97)     # 'a'
chr(65)     # 'A'
```

## The `ord(c) - ord('a')` index trick

Maps a lowercase letter to `0..25` — lets you use a fixed array instead of a dict.

```python
# Char frequency: O(n) time, O(1) space (26-element array)
def char_freq(s):
    freq = [0] * 26
    for c in s:
        freq[ord(c) - ord('a')] += 1
    return freq
```

Faster than a [`Counter`](#counter) when the alphabet is fixed and small.

## a-z math (Caesar shift / cipher)

```python
# Rotate a lowercase letter by k, wrapping around
def shift(c, k):
    return chr((ord(c) - ord('a') + k) % 26 + ord('a'))

shift('z', 1)   # 'a'
```

## Digit character to int

```python
ord('7') - ord('0')   # 7   (manual atoi step)
int('7')              # 7   (also fine for single chars)
```

Anagram via 26-array: two strings are anagrams iff their `char_freq` arrays match.

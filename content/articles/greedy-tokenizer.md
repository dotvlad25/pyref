---
id: greedy-tokenizer
title: Greedy Longest-Match Tokenizer
keywords: [tokenizer, greedy tokenization, longest match, trie tokenizer, bpe, wordpiece, sentencepiece, vocab, subword, max munch, segment text]
category: Algorithms
type: algo
related: [trie, dict, set, string-methods, recursion-memoization]
---
# Greedy Longest-Match Tokenizer

Segment text by repeatedly taking the **longest vocabulary token** that matches at the current position (maximal-munch). This is essentially how WordPiece does *inference*.

## Set lookup — O(n · M²)

Try lengths from longest to shortest at each position (`M` = longest vocab word):

```python
def tokenize(text, vocab):
    if not text:
        return []
    max_len = max((len(w) for w in vocab), default=0)
    tokens, i = [], 0
    while i < len(text):
        for length in range(min(max_len, len(text) - i), 0, -1):
            piece = text[i:i + length]
            if piece in vocab:
                tokens.append(piece)
                i += length
                break
        else:                          # no match -> single char as unknown
            tokens.append(text[i])
            i += 1
    return tokens

# vocab = {"the","there","he","her","here","red"}
# tokenize("theredhered", vocab) -> ["there","d","here","d"]
#   pos 0: "there"(5) beats "the"(3);  pos 6: "here"(4) beats "her"(3)
```

## Trie — O(n · L)

For a large vocab (100k+), a [trie](#trie) avoids building substrings and stops early. Walk characters from the current position, remembering the **last** end-of-word seen — that's the longest match.

```python
class Trie:
    def __init__(self):
        self.children, self.word = {}, None

    def insert(self, w):
        node = self
        for ch in w:
            node = node.children.setdefault(ch, Trie())
        node.word = w

    def longest_match(self, text, start):
        node, best = self, None
        for i in range(start, len(text)):
            node = node.children.get(text[i])
            if node is None:
                break
            if node.word is not None:
                best = node.word        # keep going — a longer match may exist
        return best

def tokenize_trie(text, vocab):
    trie = Trie()
    for w in vocab:
        trie.insert(w)
    tokens, i = [], 0
    while i < len(text):
        m = trie.longest_match(text, i)
        if m:
            tokens.append(m); i += len(m)
        else:
            tokens.append(text[i]); i += 1
    return tokens
```

**Don't stop at the first end-of-word** — `"the"` ends inside `"there"`, but you want the longer token, so keep walking and record the last match.

## Relation to real tokenizers

- **WordPiece** (BERT) — inference *is* greedy longest-match against the vocab, exactly this article (with a `##` prefix on non-initial pieces).
- **BPE** — trained by merging frequent adjacent pairs; inference applies the learned merges in rank order, not longest-match.
- **Unigram / SentencePiece** — scores segmentations by likelihood and picks the best (Viterbi), so it is *not* greedy; adds byte-level fallback so any Unicode is representable.
- **All tokenizations** — DP where `dp[i]` = ways to segment `text[:i]`; greedy longest-match isn't always optimal for downstream models.

## Notes

- Set version is O(n·M²): each position tries up to M substrings, and slicing plus string hashing cost O(length). Trie is O(n·L) in the actual match length and skips slicing on misses.
- Unicode: iterate over code points (Python `str` already does) and consider `unicodedata.normalize("NFC", text)` before tokenizing.

---
id: trie
title: Trie (Prefix Tree)
keywords: [trie, prefix tree, autocomplete, startswith, insert, search, defaultdict, word dictionary, prefix]
category: Data Structures
related: [defaultdict, dfs, dict]
---
# Trie (Prefix Tree)

A tree keyed by characters — perfect for prefix queries and autocomplete. Insert/search are **O(L)** in the word length, independent of how many words are stored.

## Class-based

```python
class TrieNode:
    def __init__(self):
        self.children = {}       # char -> TrieNode
        self.is_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_word = True

    def _find(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def search(self, word: str) -> bool:
        node = self._find(word)
        return node is not None and node.is_word

    def starts_with(self, prefix: str) -> bool:
        return self._find(prefix) is not None
```

## Compact nested-defaultdict version

```python
from collections import defaultdict

trie = lambda: defaultdict(trie)
root = trie()

def insert(word):
    node = root
    for ch in word:
        node = node[ch]
    node["$"] = True         # end-of-word marker
```

Great when you want a Trie in a few lines. See [defaultdict](#).

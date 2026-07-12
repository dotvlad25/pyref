---
id: lru-cache-from-scratch
title: LRU Cache From Scratch
keywords: [lru cache, least recently used, leetcode 146, hash map plus doubly linked list, o(1) get put, eviction, dll, sentinel nodes, ordereddict alternative]
category: Data Structures
related: [doubly-linked-list, ordereddict, lru-cache, functools-cache, dict, hashable-objects]
---
# LRU Cache From Scratch

O(1) `get` and `put` with a capacity limit; evict the **least recently used** key when full. Two structures: a **dict** `key -> node` for O(1) lookup, and a **doubly linked list** ordered by recency (front = most recent, back = least). The DLL is what makes evicting *and* re-ordering an arbitrary node O(1) — a plain list would be O(n) to move/remove a middle element.

The concise version uses [OrderedDict](#ordereddict) (`move_to_end` + `popitem(last=False)`). Below is the from-scratch version built directly on a dict and a doubly linked list.

```python
class Node:
    __slots__ = ("key", "val", "prev", "next")
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}                       # key -> Node
        self.head = Node()                  # sentinel: most-recent side
        self.tail = Node()                  # sentinel: least-recent side
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):                # unlink — O(1)
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_front(self, node):             # insert right after head
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)                  # move to front (most recent)
        self._add_front(node)
        return node.val

    def put(self, key, value):
        if key in self.map:
            self._remove(self.map[key])     # will re-add at front
        node = Node(key, value)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.cap:
            lru = self.tail.prev            # node before tail sentinel
            self._remove(lru)
            del self.map[lru.key]           # key lets us evict from the dict
```

## Why the DLL + sentinels

- **DLL gives O(1) eviction of any node**: given the node reference (from the dict), `node.prev`/`node.next` splice it out with no scan. A singly linked list can't unlink in O(1); an array shifts elements.
- **Sentinel head/tail** remove all null-checks — every real node always has non-None neighbors ([doubly linked list](#doubly-linked-list)).
- **Node stores `key`** so eviction can delete from `self.map` (the DLL only knows nodes, not dict keys).

All ops O(1) time, O(capacity) space.

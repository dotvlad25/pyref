---
id: doubly-linked-list
title: Doubly Linked List
keywords: [doubly linked list, linked list, node, prev, next, sentinel, dummy head, O(1) removal, dll]
category: Data Structures
type: reference
related: [lru-cache, linked-list, deque]
---
# Doubly Linked List

Each node points both ways, so you can remove or insert a node in **O(1)** given a reference to it. The classic use is the recency list inside an [LRU cache](#).

Use **sentinel** (dummy) head and tail nodes to eliminate null-checks at the boundaries.

```python
class Node:
    __slots__ = ("key", "val", "prev", "next")
    def __init__(self, key=None, val=None):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class DoublyLinkedList:
    def __init__(self):
        self.head = Node()          # sentinel
        self.tail = Node()          # sentinel
        self.head.next = self.tail
        self.tail.prev = self.head

    def add_front(self, node):      # insert right after head
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def remove(self, node):         # unlink any node — O(1)
        node.prev.next = node.next
        node.next.prev = node.prev

    def pop_back(self):             # remove & return node before tail
        node = self.tail.prev
        if node is self.head:
            return None
        self.remove(node)
        return node
```

## Why sentinels

Without dummy nodes, every insert/remove must special-case "am I at the head/tail?". With sentinels, `node.prev` and `node.next` are always real nodes, so the pointer surgery above never touches `None`.

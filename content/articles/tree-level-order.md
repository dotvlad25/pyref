---
id: tree-level-order
title: Level-Order Traversal
keywords: [level order, bfs, breadth first, tree levels, deque, zigzag, right side view, per level, queue, level by level]
category: Algorithms
related: [binary-tree, tree-traversal, bfs, deque, tree-serialization]
---
# Level-Order Traversal

BFS across a tree, one level at a time. Reach for this on any "by level", zigzag, or right-side-view problem. **O(n)** time, **O(w)** space (w = max level width).

```python
from collections import deque

def level_order(root):
    if not root: return []
    result, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):       # snapshot count = this level's size
            node = q.popleft()
            level.append(node.val)
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        result.append(level)          # one sublist per level
    return result
```

The `for _ in range(len(q))` trick is the key: it freezes the current level before children are enqueued.

## Zigzag (alternate L→R / R→L)

```python
def zigzag(root):
    if not root: return []
    out, q, left_to_right = [], deque([root]), True
    while q:
        level = deque()
        for _ in range(len(q)):
            node = q.popleft()
            if left_to_right: level.append(node.val)
            else:             level.appendleft(node.val)   # O(1) front insert
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        out.append(list(level))
        left_to_right = not left_to_right
    return out
```

## Right-side view

```python
def right_view(root):
    if not root: return []
    out, q = [], deque([root])
    while q:
        n = len(q)
        for i in range(n):
            node = q.popleft()
            if i == n - 1: out.append(node.val)   # last node of each level
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
    return out
```

Same [deque](#deque) BFS engine as [graph BFS](#bfs); the level-size loop is what makes it tree-level-aware.

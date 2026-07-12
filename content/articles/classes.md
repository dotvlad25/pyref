---
id: classes
title: Classes & __init__
keywords: [class, __init__, constructor, self, instance variable, class variable, attribute, method, oop, object, this, ListNode, TreeNode]
category: OOP
related: [dataclasses, magic-methods, slots, abc, linked-list, doubly-linked-list]
---
# Classes & __init__

Reach for a class when you need to bundle state + behavior. The constructor is always `__init__`, and `self` is explicit in every method — Python has no implicit `this`.

```python
class Point:
    count = 0                 # CLASS var: shared by all instances

    def __init__(self, x, y): # constructor
        self.x = x            # INSTANCE var: per-object
        self.y = y
        Point.count += 1      # mutate class var via the class

    def dist(self):           # method — self is passed automatically
        return (self.x**2 + self.y**2) ** 0.5

p = Point(3, 4)
p.dist()          # 5.0  (called as p.dist(), not dist(p))
Point.count       # 1
```

## Node classes

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right
```

## Instance vs class variable gotcha

```python
class Bad:
    items = []                # SHARED across all instances!
    def add(self, x):
        self.items.append(x)  # mutates the shared list

a, b = Bad(), Bad()
a.add(1); b.add(2)
a.items                       # [1, 2]  — leaked between objects!
```

Fix: assign mutable defaults **inside** `__init__` (`self.items = []`) so each object gets its own. Reading `self.attr` falls back to the class var; assigning `self.attr = ...` creates an instance var that shadows it. For plain data records, prefer [`@dataclass`](#dataclasses).

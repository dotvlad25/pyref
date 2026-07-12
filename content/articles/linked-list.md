---
id: linked-list
title: Singly Linked List
keywords: [linked list, singly linked list, node, next, reverse, dummy head, fast slow pointer, merge, cycle]
category: Data Structures
related: [doubly-linked-list, two-pointers, deque]
---
# Singly Linked List

Each node holds a value and a `next` pointer. Common operations: reversal, cycle detection, and merging — all in **O(1)** extra space.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

## Reverse a linked list (iterative)

```python
def reverse(head):
    prev = None
    while head:
        nxt = head.next      # save next
        head.next = prev     # flip pointer
        prev = head          # advance prev
        head = nxt           # advance head
    return prev              # new head
```

## Dummy head — simplify insert/delete

A sentinel node removes the "is this the head?" special case:

```python
def remove_val(head, target):
    dummy = ListNode(0, head)
    prev, cur = dummy, head
    while cur:
        if cur.val == target:
            prev.next = cur.next     # unlink
        else:
            prev = cur
        cur = cur.next
    return dummy.next
```

## Find the middle (fast/slow pointers)

```python
def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next          # +1
        fast = fast.next.next     # +2
    return slow                   # slow lands on the middle
```

## Merge two sorted lists

```python
def merge(a, b):
    dummy = tail = ListNode()
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b            # attach the remainder
    return dummy.next
```

For O(1) removal from both ends, see [doubly linked list](#); the [two-pointers](#) fast/slow trick also detects cycles.

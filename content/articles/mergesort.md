---
id: mergesort
title: Merge Sort
keywords: [merge sort, mergesort, divide and conquer, merge, stable sort, O(n log n), linked list sort, external sort, timsort, count inversions]
category: Algorithms
type: algo
related: [quicksort, count-smaller-right, linked-list, sorting-key, quickselect]
---
# Merge Sort

Reach for this when you need a **stable** O(n log n) sort, are sorting a [linked list](#linked-list), or must count inversions. **O(n log n)** time always (no bad-input worst case), **O(n)** extra space for arrays. Python's built-in `sorted()` is Timsort, a merge-sort variant.

Split in half, sort each half, then **merge** two sorted halves.

```python
def mergesort(nums):
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left = mergesort(nums[:mid])
    right = mergesort(nums[mid:])
    return merge(left, right)

def merge(a, b):
    out, i, j = [], 0, 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:             # <= keeps it STABLE
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    out.extend(a[i:])                # append leftovers
    out.extend(b[j:])
    return out
```

## Why merge sort for linked lists

No random access needed and merging is pointer-splicing — O(1) extra space, unlike arrays. Find the middle with slow/fast pointers, split, recurse, merge.

```python
def sort_list(head):
    if not head or not head.next:
        return head
    slow, fast = head, head.next     # split into two halves
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    mid = slow.next
    slow.next = None
    return merge_lists(sort_list(head), sort_list(mid))

def merge_lists(a, b):
    dummy = tail = ListNode()
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b               # attach remaining nodes
    return dummy.next
```

Prefer [quicksort](#quicksort) for in-place array sorting when stability doesn't matter and memory is tight.

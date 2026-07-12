---
id: validate-bst
title: Validate a BST
keywords: [validate bst, is valid bst, min max bounds, bst property, verify bst, inorder check, sorted check, range recursion]
category: Algorithms
type: algo
related: [bst, tree-traversal, tree-recursion-patterns, binary-tree, lowest-common-ancestor]
---
# Validate a BST

Check the [BST](#bst) invariant: every node must be greater than *everything* in its left subtree and less than *everything* in its right subtree. **O(n)** time.

## Min/max bounds recursion (canonical)

Each node carries an allowed open interval `(low, high)` that tightens as you descend.

```python
def is_valid_bst(root, low=float("-inf"), high=float("inf")):
    if not root:
        return True                         # empty subtree is valid
    if not (low < root.val < high):         # must fit its inherited range
        return False
    return (is_valid_bst(root.left,  low, root.val) and   # right bound tightens
            is_valid_bst(root.right, root.val, high))       # left bound tightens
```

The classic bug is only comparing a node to its direct children — that misses violations deeper down. Bounds fix it: going left caps the `high` at the parent's value; going right raises the `low`.

## Inorder alternative — must be strictly increasing

Since inorder of a BST is sorted, walk it and verify each value exceeds the previous.

```python
def is_valid_bst_inorder(root):
    prev = float("-inf")
    stack, node = [], root
    while node or stack:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        if node.val <= prev:                # equal not allowed (strict)
            return False
        prev = node.val
        node = node.right
    return True
```

## Gotchas

```python
# - Use STRICT < (duplicates break the standard BST definition).
# - Init bounds with +/- inf, not the root's value.
# - Don't just check node vs its two children -- check against inherited bounds.
```

---
id: bst
title: Binary Search Tree
keywords: [bst, binary search tree, insert, search, delete, remove, inorder sorted, kth smallest, ordered, successor, floor, ceiling]
category: Data Structures
related: [binary-tree, tree-traversal, validate-bst, lowest-common-ancestor, tree-recursion-patterns, binary-search]
---
# Binary Search Tree

BST invariant: for every node, **left subtree < node < right subtree**. That ordering makes search/insert/delete **O(h)** — O(log n) if balanced, O(n) if skewed.

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val; self.left = left; self.right = right
```

## Search & insert

```python
def search(root, target):
    while root:
        if target == root.val: return root
        root = root.left if target < root.val else root.right   # discard half
    return None

def insert(root, val):
    if not root: return TreeNode(val)      # empty spot found -> create node
    if val < root.val: root.left  = insert(root.left, val)
    else:              root.right = insert(root.right, val)
    return root                            # return subtree root back up
```

## Delete (the tricky one)

Three cases: leaf, one child, two children. For two children, swap with the inorder successor (smallest in the right subtree).

```python
def delete(root, key):
    if not root: return None
    if   key < root.val: root.left  = delete(root.left, key)
    elif key > root.val: root.right = delete(root.right, key)
    else:                                   # found the node to remove
        if not root.left:  return root.right   # 0/1 child
        if not root.right: return root.left
        succ = root.right                   # inorder successor
        while succ.left: succ = succ.left
        root.val = succ.val                 # copy successor value up
        root.right = delete(root.right, succ.val)  # delete the successor
    return root
```

## Inorder = sorted (the key insight)

```python
# left -> root -> right on a BST yields ascending values.
# Powers: validate BST, kth smallest, BST iterator, range queries.
```

Use this for [kth smallest](#tree-traversal) (stop the inorder walk after k), [validate BST](#validate-bst), and BST-aware [LCA](#lowest-common-ancestor).

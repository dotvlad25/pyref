---
id: lowest-common-ancestor
title: Lowest Common Ancestor
keywords: [lca, lowest common ancestor, common parent, ancestor, bst lca, binary tree lca, deepest common node]
category: Algorithms
type: algo
related: [binary-tree, bst, tree-recursion-patterns, tree-traversal, dfs]
---
# Lowest Common Ancestor

The LCA of nodes `p` and `q` is the deepest node that has both as descendants (a node can be its own ancestor).

## General binary tree — DFS returning the node

```python
def lca(root, p, q):
    if not root or root is p or root is q:
        return root                    # found a target (or hit empty)
    left  = lca(root.left,  p, q)
    right = lca(root.right, p, q)
    if left and right:                 # p and q found on opposite sides
        return root                    # => current node is the LCA
    return left or right               # both on one side (or neither)
```

**O(n)** time, **O(h)** stack. Assumes both nodes exist in the tree. The insight: a node is the LCA exactly when the two targets surface from its left and right subtrees.

## BST — use the ordering, no full search

In a [BST](#bst) you walk down guided by value comparison. **O(h)** time, **O(1)** space.

```python
def lca_bst(root, p, q):
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left           # both smaller -> go left
        elif p.val > root.val and q.val > root.val:
            root = root.right          # both larger -> go right
        else:
            return root                # split point (or equals one) = LCA
    return None
```

The split point — where `p` and `q` diverge (one ≤ node ≤ other) — is the LCA. Prefer the BST version whenever the tree is ordered; it skips exploring irrelevant subtrees.

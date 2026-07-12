---
id: tree-traversal
title: Tree Traversals
keywords: [inorder, preorder, postorder, tree traversal, dfs traversal, iterative traversal, recursive traversal, stack, visit order, morris]
category: Algorithms
related: [binary-tree, tree-level-order, bst, validate-bst, stack, dfs]
---
# Tree Traversals

Three depth-first orders — the foundation of almost every tree problem. All are **O(n)** time.

```python
# Inorder:   left -> root -> right   (BST => sorted order)
def inorder(root):
    if not root: return []
    return inorder(root.left) + [root.val] + inorder(root.right)

# Preorder:  root -> left -> right   (serialize / copy a tree)
def preorder(root):
    if not root: return []
    return [root.val] + preorder(root.left) + preorder(root.right)

# Postorder: left -> right -> root   (delete tree, evaluate expression)
def postorder(root):
    if not root: return []
    return postorder(root.left) + postorder(root.right) + [root.val]
```

Mnemonic: the prefix (pre/in/post) says *when the root is visited*.

## Iterative inorder (explicit stack)

An iterative version avoids recursion. Push all lefts, then process + go right.

```python
def inorder_iter(root):
    stack, out, node = [], [], root
    while node or stack:
        while node:                 # dive left
            stack.append(node)
            node = node.left
        node = stack.pop()          # leftmost unprocessed
        out.append(node.val)
        node = node.right           # then explore right
    return out
```

## Iterative preorder

```python
def preorder_iter(root):
    if not root: return []
    stack, out = [root], []
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right: stack.append(node.right)  # push right first...
        if node.left:  stack.append(node.left)   # ...so left pops first (LIFO)
    return out
```

Iterative [postorder](#stack): easiest is reversed(preorder with left/right swapped). For breadth-first, see [Level-Order](#tree-level-order).

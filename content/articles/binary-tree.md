---
id: binary-tree
title: Binary Tree Basics
keywords: [binary tree, treenode, tree node, node class, build tree, height, depth, max depth, count nodes, leaf, subtree]
category: Data Structures
related: [tree-traversal, tree-level-order, tree-recursion-patterns, bst, dfs, recursion-memoization]
---
# Binary Tree Basics

Python has no built-in tree — define the node class inline.

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

## Build by hand

```python
#        1
#       / \
#      2   3
#     / \
#    4   5
root = TreeNode(1,
    TreeNode(2, TreeNode(4), TreeNode(5)),
    TreeNode(3))
```

## Height / max depth — the "hello world" of tree recursion

```python
def max_depth(root):
    if not root: return 0                       # empty subtree = height 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
# O(n) time, O(h) recursion stack (h = height; n for a skewed tree)
```

Empty tree returns 0; a single node returns 1.

## Count nodes & find leaves

```python
def count(root):
    if not root: return 0
    return 1 + count(root.left) + count(root.right)

def count_leaves(root):
    if not root: return 0
    if not root.left and not root.right: return 1   # leaf test
    return count_leaves(root.left) + count_leaves(root.right)
```

Almost every tree problem is a DFS returning a value up from each subtree — see [Recursive Tree Patterns](#tree-recursion-patterns) and [Tree Traversals](#tree-traversal). For visiting by depth, use [Level-Order](#tree-level-order).

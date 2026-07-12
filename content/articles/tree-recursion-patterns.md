---
id: tree-recursion-patterns
title: Recursive Tree Patterns
keywords: [tree recursion, dfs return value, height, diameter, path sum, max path sum, balanced, bottom up, divide and conquer, subtree]
category: Patterns
type: pattern
related: [binary-tree, tree-traversal, lowest-common-ancestor, validate-bst, recursion-memoization, dfs]
---
# Recursive Tree Patterns

Nearly every tree problem is one recursion: **compute a value from each subtree, combine at the root**. Base case is the empty node. All **O(n)** time, **O(h)** stack.

## Height / max depth

```python
def height(root):
    if not root: return 0
    return 1 + max(height(root.left), height(root.right))
```

## Path sum — any root-to-leaf path == target?

```python
def has_path_sum(root, target):
    if not root: return False
    if not root.left and not root.right:        # leaf
        return root.val == target
    rest = target - root.val
    return has_path_sum(root.left, rest) or has_path_sum(root.right, rest)
```

## Diameter — longest path between any two nodes

The trick: the recursion returns *height*, but a side effect tracks the best path through each node.

```python
def diameter(root):
    best = 0
    def depth(node):
        nonlocal best
        if not node: return 0
        l, r = depth(node.left), depth(node.right)
        best = max(best, l + r)      # path THROUGH node = left depth + right depth
        return 1 + max(l, r)         # but return HEIGHT to the parent
    depth(root)
    return best
```

## Max path sum (values, any node to any node)

Same shape — negative branches are dropped with `max(..., 0)`.

```python
def max_path_sum(root):
    best = float("-inf")
    def gain(node):
        nonlocal best
        if not node: return 0
        l = max(gain(node.left), 0)      # ignore negative contributions
        r = max(gain(node.right), 0)
        best = max(best, node.val + l + r)   # path bending at node
        return node.val + max(l, r)          # straight path for parent
    gain(root)
    return best
```

The recurring idea: **return one thing to the parent, record another via `nonlocal`**. See also [LCA](#lowest-common-ancestor) and [validate-bst](#validate-bst).

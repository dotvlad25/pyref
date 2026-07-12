---
id: tree-serialization
title: Serialize/Deserialize Tree
keywords: [serialize, deserialize, encode tree, decode tree, preorder serialization, null marker, codec, reconstruct tree, tree to string]
category: Algorithms
related: [binary-tree, tree-traversal, tree-level-order, deque, dfs]
---
# Serialize/Deserialize Tree

Turn a tree into a string and back. Preorder with explicit **null markers** is the cleanest, because preorder + knowing where the nulls are uniquely rebuilds the tree. Both directions **O(n)**.

## Serialize — preorder DFS

```python
def serialize(root):
    out = []
    def dfs(node):
        if not node:
            out.append("#")            # null marker (sentinel)
            return
        out.append(str(node.val))
        dfs(node.left)
        dfs(node.right)
    dfs(root)
    return ",".join(out)               # e.g. "1,2,#,#,3,#,#"
```

## Deserialize — consume the same preorder stream

Use an iterator so each call pulls the next token in order.

```python
from collections import deque

def deserialize(data):
    vals = deque(data.split(","))
    def build():
        val = vals.popleft()
        if val == "#":                 # null -> empty subtree
            return None
        node = TreeNode(int(val))
        node.left  = build()           # SAME order as serialize wrote them
        node.right = build()
        return node
    return build()
```

The two functions must agree on order: serialize writes root, left, right; deserialize reads root, left, right. That symmetry is the whole trick.

## Gotchas

```python
# - Use a sentinel ("#") for null; don't rely on structure alone.
# - str(val) then int(val): values are text in the payload.
# - Empty tree round-trips fine: serialize(None) == "#".
# - A deque/iterator (not index math) keeps deserialize O(n) and clean.
```

Level-order (BFS with [deque](#deque)) is an alternative encoding — see [Level-Order](#tree-level-order). Preorder here reuses the [traversal](#tree-traversal) you already know.

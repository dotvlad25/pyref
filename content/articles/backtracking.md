---
id: backtracking
title: Backtracking Template
keywords: [backtracking, choose explore unchoose, subsets, permutations, combinations, combination sum, dfs recursion, path pop, prune, powerset]
category: Algorithms
related: [recursion-memoization, dfs, matrix-patterns, set]
---
# Backtracking Template

Reach for this on **"all subsets / permutations / combinations / paths"** problems. Build a partial `path`, recurse, then **undo** the choice. Pattern is always **choose → explore → unchoose**.

```python
def backtrack(path, choices, res):
    if is_solution(path):
        res.append(path[:])   # COPY! append path directly -> all results alias & mutate
        return
    for c in choices:
        path.append(c)                 # choose
        backtrack(path, next_choices, res)  # explore
        path.pop()                     # unchoose (restore state)
```

## Subsets (powerset) — O(N·2^N)

```python
def subsets(nums):
    res = []
    def dfs(start, path):
        res.append(path[:])            # every node is a valid subset
        for i in range(start, len(nums)):
            path.append(nums[i])
            dfs(i + 1, path)           # i+1: don't reuse earlier elements
            path.pop()
    dfs(0, [])
    return res
```

## Permutations — O(N·N!)

```python
def permutations(nums):
    res = []
    def dfs(path, remaining):
        if not remaining:
            res.append(path[:])
            return
        for i in range(len(remaining)):
            dfs(path + [remaining[i]], remaining[:i] + remaining[i+1:])
    dfs([], nums)
    return res
```

## Combination sum (reuse allowed) — prune on overshoot

```python
def combination_sum(candidates, target):
    res = []
    def dfs(start, path, total):
        if total == target:
            res.append(path[:]); return
        if total > target:
            return                      # prune: past target, stop
        for i in range(start, len(candidates)):
            path.append(candidates[i])
            dfs(i, path, total + candidates[i])  # i (not i+1) -> reuse allowed
            path.pop()
    dfs(0, [], 0)
    return res
```

Gotcha: always append `path[:]` (or `list(path)`), never `path`. Sort input + skip duplicates (`if i > start and nums[i]==nums[i-1]: continue`) to avoid dup results. See [dfs](#dfs) and [recursion & memoization](#recursion-memoization).

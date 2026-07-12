---
id: greedy
title: Greedy Patterns
keywords: [greedy, greedy algorithm, jump game, interval, activity selection, gas station, exchange argument, locally optimal, coin change greedy, when greedy works]
category: Algorithms
type: pattern
related: [interval-scheduling, sorting-key, heapq, two-pointers]
---
# Greedy Patterns

Reach for greedy when a **locally optimal choice** provably leads to a global optimum. Cheaper than DP (usually O(N log N) for the sort) — but only correct if the problem has the **greedy-choice property**. When in doubt, verify with an exchange argument or fall back to DP.

## When greedy works (signals)

```python
# - You can sort by a single criterion and make one pass.
# - "Maximum number of non-overlapping ..." -> sort by end time.
# - "Minimum number of ... to cover ..." -> sort, extend greedily.
# - Exchange argument holds: swapping toward the greedy pick never hurts.
# COUNTER-EXAMPLE: coin change with arbitrary denominations needs DP,
#   greedy (largest coin first) fails, e.g. coins=[1,3,4], amount=6.
```

## Jump Game — can you reach the end? O(N)

```python
def can_jump(nums):
    reach = 0
    for i, n in enumerate(nums):
        if i > reach:            # gap: current index unreachable
            return False
        reach = max(reach, i + n)  # greedily extend farthest reach
    return True
```

## Jump Game II — fewest jumps (BFS-like greedy) O(N)

```python
def min_jumps(nums):
    jumps = end = farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == end:             # must jump; commit to the best reach so far
            jumps += 1
            end = farthest
    return jumps
```

## Interval greedy — max non-overlapping (sort by end)

```python
def max_non_overlapping(intervals):
    intervals.sort(key=lambda x: x[1])   # earliest finish first
    count, cur_end = 0, float('-inf')
    for s, e in intervals:
        if s >= cur_end:                 # doesn't overlap -> take it
            count += 1
            cur_end = e
    return count
```

## Gas station — O(N)

```python
def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1                        # total deficit -> impossible
    start = tank = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:                     # can't reach i+1 from start
            start, tank = i + 1, 0       # restart after the failing station
    return start
```

See [interval scheduling](#interval-scheduling) and [sorting key](#sorting-key). For scheduling with resources, a [heap](#heapq) often pairs with greedy.

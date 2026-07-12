---
id: merge-intervals
title: Merge Intervals
keywords: [merge intervals, overlapping intervals, sort by start, insert interval, meeting rooms, interval scheduling, sweep line, overlap, union of ranges]
category: Algorithms
related: [sorting-key, two-pointers, heapq, sliding-window]
---
# Merge Intervals

Reach for this whenever the problem gives you `[start, end]` ranges and asks to combine, count, or detect overlaps (LeetCode #56, #57, #253). The move is almost always: **sort by start, then sweep**. Time **O(n log n)** (the sort dominates), space O(n).

```python
def merge(intervals):
    intervals.sort(key=lambda x: x[0])        # sort by start
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        last = merged[-1]
        if start <= last[1]:                  # overlap (touching counts)
            last[1] = max(last[1], end)       # extend the current merge
        else:
            merged.append([start, end])       # disjoint -> new interval
    return merged
```

The single insight: after sorting by start, an interval overlaps the running one **iff its start ≤ the current end**. Use `max` on the end because the new interval can be fully contained.

## Insert into an already-sorted, non-overlapping list (O(n))

```python
def insert(intervals, new):
    res, i, n = [], 0, len(intervals)
    while i < n and intervals[i][1] < new[0]:  # entirely before new
        res.append(intervals[i]); i += 1
    while i < n and intervals[i][0] <= new[1]: # overlaps new -> absorb
        new[0] = min(new[0], intervals[i][0])
        new[1] = max(new[1], intervals[i][1])
        i += 1
    res.append(new)
    res.extend(intervals[i:])                  # entirely after new
    return res
```

## Related sweeps

```python
# Min meeting rooms: sort starts & ends separately, or push ends to a heap.
# Whether "touching" ([1,2],[2,3]) counts as overlap depends on the prompt --
#   use start <  last_end for strict, start <= last_end for touching.
```

See [sorting with key](#sorting-key) for the sort step and [heapq](#heapq) for the meeting-rooms variant.

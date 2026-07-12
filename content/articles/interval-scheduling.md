---
id: interval-scheduling
title: Interval Scheduling
keywords: [interval scheduling, intervals, merge intervals, sort by end, sort by start, non overlapping intervals, meeting rooms, activity selection, erase overlap, min arrows]
category: Algorithms
related: [greedy, sorting-key, heapq, two-heap-median]
---
# Interval Scheduling

Reach for this on problems with `(start, end)` pairs: **merge**, **count non-overlapping**, **min rooms**. The key decision is *what to sort by*.

## Merge overlapping intervals — sort by START, O(N log N)

```python
def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = []
    for s, e in intervals:
        if merged and s <= merged[-1][1]:       # overlaps previous
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    return merged
```

## Max non-overlapping — sort by END (activity selection)

Sorting by earliest finish time is the greedy optimum: it leaves the most room for later picks.

```python
def max_non_overlapping(intervals):
    intervals.sort(key=lambda x: x[1])          # earliest end first
    count, cur_end = 0, float('-inf')
    for s, e in intervals:
        if s >= cur_end:                        # no overlap -> take it
            count += 1
            cur_end = e
    return count

# Min intervals to REMOVE = len(intervals) - max_non_overlapping(intervals)
```

## Minimum meeting rooms — min-heap of end times, O(N log N)

```python
import heapq
def min_meeting_rooms(intervals):
    intervals.sort(key=lambda x: x[0])          # by start
    heap = []                                    # ends of ongoing meetings
    for s, e in intervals:
        if heap and heap[0] <= s:                # a room freed up before s
            heapq.heappop(heap)
        heapq.heappush(heap, e)
    return len(heap)                             # peak concurrency
```

## Sweep-line alternative for peak overlap

```python
def max_overlap(intervals):
    events = []
    for s, e in intervals:
        events.append((s, 1))    # +1 on start
        events.append((e, -1))   # -1 on end; ties: end before start (e,-1)<(s,1)
    events.sort()
    cur = best = 0
    for _, delta in events:
        cur += delta
        best = max(best, cur)
    return best
```

Rule of thumb: **merge/overlap → sort by start; count non-overlapping → sort by end.** See [greedy](#greedy), [sorting key](#sorting-key), [heapq](#heapq).

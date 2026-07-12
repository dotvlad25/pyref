---
id: two-heap-median
title: Two-Heap Running Median
keywords: [median, two heap, running median, streaming median, heap, max heap, min heap, find median from data stream]
category: Patterns
type: pattern
related: [heapq, heap-tuples, top-k]
---
# Two-Heap Running Median

Maintain the median of a growing stream in **O(log N)** per insert. Split the numbers into two halves:

- a **max-heap** for the lower half (largest of the low half on top),
- a **min-heap** for the upper half (smallest of the high half on top).

Keep the heaps balanced (sizes differ by ≤ 1). The median is the top of the larger heap, or the average of both tops when equal.

```python
import heapq

class MedianFinder:
    def __init__(self):
        self.low = []    # max-heap (store negatives)
        self.high = []   # min-heap

    def add_num(self, num: int) -> None:
        # Push to low, then move low's max over to high (keeps ordering correct)
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        # Rebalance so low is never smaller than high
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def find_median(self) -> float:
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2
```

The "push to low, pop to high, rebalance" dance guarantees every element in `low` ≤ every element in `high`, so the tops straddle the median.

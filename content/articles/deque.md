---
id: deque
title: collections.deque
keywords: [deque, double ended queue, queue, stack, appendleft, popleft, rotate, O(1), sliding window, collections]
category: Data Structures
type: reference
related: [queue-module, stack, sliding-window, doubly-linked-list, bfs]
---
# collections.deque

A double-ended queue with **O(1)** append and pop at *both* ends. This is the correct queue for BFS and the go-to for sliding windows. (A plain list's `pop(0)` is O(N) — never use it as a queue.)

```python
from collections import deque

dq = deque([1, 2, 3])

dq.append(4)        # right push   -> [1,2,3,4]
dq.appendleft(0)    # left push    -> [0,1,2,3,4]
dq.pop()            # right pop    -> 4
dq.popleft()        # left pop     -> 0

dq.extend([5, 6])       # extend right
dq.extendleft([-1])     # extend left (note: reverses the added order)
dq.rotate(1)            # rotate right by 1
```

## Bounded deque (sliding buffer)

```python
last3 = deque(maxlen=3)
for x in range(5):
    last3.append(x)     # automatically drops from the left when full
# last3 -> deque([2, 3, 4], maxlen=3)
```

## As a queue (FIFO) — the BFS pattern

```python
q = deque([start])
while q:
    node = q.popleft()      # O(1)
    for nb in graph[node]:
        q.append(nb)
```

For a thread-safe queue across threads, use the [`queue` module](#) instead.

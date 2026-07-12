---
id: barriers
title: Barriers
keywords: [barrier, threading.Barrier, wait, parties, synchronization point, checkpoint, rendezvous, phase, BrokenBarrierError, abort, action]
category: Concurrency
type: reference
related: [semaphores, events, condition-variables, locks, threading-basics]
---
# Barriers

Reach for a `Barrier` to make a fixed number of threads all reach a checkpoint before **any** proceeds — a rendezvous between phases of a parallel computation.

```python
import threading, time, random

sync_point = threading.Barrier(3)          # need 3 threads (parties) to meet

def phase_worker(i):
    time.sleep(random.uniform(0.5, 2.0))
    print(f"worker {i} done phase 1, waiting at barrier...")
    sync_point.wait()                      # blocks until all 3 arrive, then all release together
    print(f"worker {i} starting phase 2")

for i in range(3):
    threading.Thread(target=phase_worker, args=(i,)).start()
```

The N-th thread to call `wait()` trips the barrier and wakes all of them at once. A barrier is **reusable** — it resets automatically after tripping, so it works across many phases in a loop.

## Optional action + return value

```python
def setup():
    print("all arrived — runs once, in one thread")

barrier = threading.Barrier(3, action=setup)   # action fires when the barrier trips

i = barrier.wait()                             # returns a unique 0..N-1 index per thread
if i == 0:
    print("elected leader for this round")
```

## Broken barriers

```python
try:
    barrier.wait(timeout=5)                 # timeout breaks the barrier for ALL parties
except threading.BrokenBarrierError:
    ...                                     # a thread timed out, called abort(), or reset()
barrier.reset()                             # return to clean state
```

Gotcha: if fewer than N threads ever arrive, `wait()` blocks forever — always pass a `timeout` or ensure exactly `parties` threads participate. Contrast with an [Event](#events) (one-shot broadcast) and a [Semaphore](#semaphores) that limits, not synchronizes.

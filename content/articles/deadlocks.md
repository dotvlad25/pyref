---
id: deadlocks
title: Deadlocks & Avoidance
keywords: [deadlock, lock ordering, circular wait, timeout, acquire timeout, hang, freeze, livelock, nested locks, consistent order, prevent deadlock]
category: Concurrency
type: concept
related: [locks, race-conditions, condition-variables, semaphores, producer-consumer]
---
# Deadlocks & Avoidance

A deadlock is two+ threads blocked forever, each holding a lock the other wants. Classic case: A holds Lock1 wants Lock2; B holds Lock2 wants Lock1.

```python
import threading, time
lock1, lock2 = threading.Lock(), threading.Lock()

def thread_a():
    with lock1:
        time.sleep(0.1)                 # let B grab lock2
        with lock2:                     # waits for lock2 forever
            ...

def thread_b():
    with lock2:
        time.sleep(0.1)
        with lock1:                     # waits for lock1 forever -> DEADLOCK
            ...
```

## Fix 1: Consistent lock ordering (the main one)

Always acquire multiple locks in the **same global order** everywhere. This makes the circular wait impossible.

```python
def safe_worker():
    with lock1:                         # BOTH threads take lock1 THEN lock2
        with lock2:
            ...
```

When ordering by data (e.g. transferring between accounts), sort by a stable key like `id()`:

```python
def transfer(a, b, amt):
    first, second = sorted((a, b), key=id)   # deterministic order avoids circular wait
    with first.lock:
        with second.lock:
            a.balance -= amt; b.balance += amt
```

## Fix 2: Timeouts (back off and retry)

```python
if lock2.acquire(timeout=5.0):          # returns False instead of blocking forever
    try:
        ...
    finally:
        lock2.release()
else:
    # couldn't get it — release held locks, back off, retry (turns silent hang into a handled error)
    ...
```

## Fix 3: Minimize critical sections

Hold locks briefly; never do blocking I/O (network, DB) while holding a lock. Prefer a single lock, an [RLock](#locks) for re-entrancy, or a [queue.Queue](#queue-module) to sidestep manual locking entirely. To surface a hang in tests, use `acquire(timeout=…)` or `faulthandler`.

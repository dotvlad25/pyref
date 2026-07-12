---
id: condition-variables
title: Condition Variables
keywords: [condition, condition variable, threading.Condition, wait, notify, notify_all, predicate loop, spurious wakeup, wait_for, signalling, wait notify]
category: Concurrency
related: [locks, events, producer-consumer, asyncio-queue, queue-module, semaphores]
---
# Condition Variables

Reach for `Condition` when a thread must wait for **application state** to change, not just for a lock. It wraps a [Lock](#locks) and adds `wait()` / `notify()` / `notify_all()`. For plain producer-consumer, prefer [queue.Queue](#queue-module) — it uses Conditions internally.

```python
import threading

items = []
condition = threading.Condition()       # wraps a Lock

def consumer():
    with condition:                     # must hold the lock to wait/notify
        while not items:                # ALWAYS a while loop, never if
            condition.wait()            # atomically releases lock + sleeps; re-acquires on wake
        print("consumed", items.pop(0))

def producer():
    with condition:
        items.append("data")
        condition.notify()              # wake ONE waiter; notify_all() for many
```

## The predicate loop is mandatory

`while not items:` (not `if`) is required because:
- **Spurious wakeups**: `wait()` can return without a matching `notify()`.
- **Notify-before-wait race**: if the producer sets state before the consumer waits, the predicate is already false and the consumer proceeds without blocking.

Both the state mutation and the `notify()` must happen while holding the lock.

## wait_for shortcut

```python
with condition:
    condition.wait_for(lambda: bool(items))   # loops on the predicate for you
    item = items.pop(0)
```

Rules of thumb: modify shared state + call `notify*()` under the lock; use `notify_all()` when multiple waiters have different predicates; use `wait(timeout=…)` to avoid waiting forever.

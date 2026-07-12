---
id: locks
title: Lock & RLock
keywords: [lock, mutex, rlock, reentrant lock, threading.Lock, threading.RLock, acquire, release, critical section, mutual exclusion, with statement, thread safe, protect shared state]
category: Concurrency
related: [per-key-locking, race-conditions, deadlocks, condition-variables, gil, threading-basics, semaphores]
---
# Lock & RLock

Reach for a `Lock` when multiple threads mutate shared state. The [GIL](#gil) makes single bytecodes atomic but **not** read-modify-write sequences, so `+=`, `list.append` chains, and check-then-act need protection. See [race conditions](#race-conditions).

```python
import threading

class SafeBankAccount:
    def __init__(self, balance=0):
        self.balance = balance
        self.lock = threading.Lock()

    def deposit(self, amount):
        with self.lock:                 # acquire on enter, release on exit (even on exception)
            self.balance += amount      # now a single atomic critical section
```

Always use `with lock:` — a manual `acquire()`/`release()` leaks the lock forever if an exception fires inside the critical section, freezing the app.

```python
lock = threading.Lock()
if lock.acquire(timeout=5.0):           # returns False if it can't grab it in time
    try:
        ...                             # critical section
    finally:
        lock.release()                  # manual form MUST use try/finally
```

## RLock (reentrant)

A plain `Lock` is **not** reentrant: the same thread acquiring it twice deadlocks against itself. Use `RLock` when a locked method calls another locked method (recursion, helper methods).

```python
class Calculator:
    def __init__(self):
        self.rlock = threading.RLock()  # same thread can re-acquire; counts depth
        self.value = 0

    def add(self, amount):
        with self.rlock:
            self.value += amount

    def double_and_add(self, amount):
        with self.rlock:
            self.value *= 2
            self.add(amount)            # re-enters the lock — a plain Lock would hang
```

`RLock` only truly unlocks after `release()` is called once per `acquire()`. Gotchas: hold locks briefly (no blocking I/O inside), and acquire multiple locks in a consistent order to avoid [deadlocks](#deadlocks).

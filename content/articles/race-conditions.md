---
id: race-conditions
title: Race Conditions & Thread Safety
keywords: [race condition, thread safety, thread safe, atomic, gil, read modify write, check then act, data corruption, shared state, compound operation, non atomic, lost update]
category: Concurrency
related: [locks, per-key-locking, gil, deadlocks, condition-variables, producer-consumer, semaphores]
---
# Race Conditions & Thread Safety

A race condition: the result depends on unpredictable thread interleaving. The [GIL](#gil) is **not enough** — it makes individual bytecodes atomic but protects the *interpreter's* memory, not *your* data.

```python
import threading, time

class BankAccount:
    def __init__(self): self.balance = 100
    def deposit(self, amt):
        current = self.balance          # READ  ── another thread can interleave
        time.sleep(0.001)               # (sleep releases the GIL, exposing the gap)
        self.balance = current + amt    # WRITE ── overwrites others' updates -> lost update

acct = BankAccount()
ts = [threading.Thread(target=lambda: [acct.deposit(10) for _ in range(100)]) for _ in range(5)]
for t in ts: t.start()
for t in ts: t.join()
print(acct.balance)                     # NOT 5100 — updates were lost
```

The bug: `deposit` is a **read-modify-write** — three steps, not one. A context switch mid-sequence loses updates. Fix with a [Lock](#locks) around the whole critical section.

## Atomic vs not

```python
x += 1                # NOT atomic: LOAD, ADD, STORE — needs a lock
d[k] = v             # single dict set: atomic in CPython
if k not in d: d[k]=v # check-then-act: NOT atomic — two ops, race between them
lst.append(x)        # atomic in CPython
```

**Rule of thumb**: any *compound* operation (read-modify-write, check-then-act) must be inside one `with lock:` block. A single bare read of an int attribute is atomic in CPython — but that's an implementation detail (not true on PyPy/Jython), so lock reads too for portable code.

```python
class ThreadSafeCounter:
    def __init__(self):
        self.value = 0
        self._lock = threading.Lock()
    def increment(self):
        with self._lock:                # protects the read-modify-write
            self.value += 1
    def increment_if_below(self, n):
        with self._lock:                # check-then-act: hold lock across BOTH
            if self.value < n:
                self.value += 1; return True
            return False
```

Prefer immutable data, thread-local state, or a [queue.Queue](#queue-module) to avoid shared mutable state entirely. Debug with logging (`%(threadName)s`), not `pdb` (it hides the race — a "Heisenbug").

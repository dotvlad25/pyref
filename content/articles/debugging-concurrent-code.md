---
id: debugging-concurrent-code
title: Debugging Concurrent Code
keywords: [debugging threads, race condition, deadlock, heisenbug, threadName, logging, faulthandler, py-spy, acquire timeout, lock timeout, thread-safe logging, non-deterministic, interleaving, pdb threads]
category: Concurrency
related: [logging, race-conditions, deadlocks, locks, threading-basics, gil, thread-exceptions]
---
# Debugging Concurrent Code

Race conditions and deadlocks are **non-deterministic** — they manifest inconsistently across runs, which makes them hard to reproduce and debug.

```python
# 1. THREAD-SAFE LOGGING (never use print() — output interleaves)
import logging, threading
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(threadName)s %(message)s",  # threadName tracks flow
)
# logging is thread-safe; print() is not. Name threads for readability:
threading.Thread(target=work, name="Worker-1").start()
```

```python
# 2. LOCK-STATE TRACKING: log around every acquire/release to see where it halts
lock = threading.Lock()
logging.debug("attempting to acquire lock A")
with lock:
    logging.debug("acquired lock A")
    ...
```

```python
# 3. ACQUIRE TIMEOUTS turn a silent deadlock into an explicit, catchable failure
if lock.acquire(timeout=5):          # blocking=True by default
    try:
        ...
    finally:
        lock.release()
else:
    logging.error("DEADLOCK suspected: could not acquire in 5s")
```

**Heisenbug**: a bug that vanishes or changes when you probe it. Standard `pdb` pauses the *entire* interpreter, altering thread timing and interleaving — it masks the very race you hunt. Prefer logging.

```bash
# Thread-aware tools (better than pdb for concurrency):
python -X faulthandler script.py   # dumps all thread stacks on hang/deadlock
py-spy dump --pid 12345            # sampling profiler; inspect live stacks, no restart
py-spy top --pid 12345             # live per-thread CPU view
```

Checklist: prefer [logging](#thread-exceptions) over print, name threads, add [acquire timeouts](#deadlocks), avoid [pdb](#race-conditions) for timing bugs, reach for `faulthandler`/`py-spy` on hangs. See [deadlocks](#deadlocks) for consistent lock ordering.

---
id: events
title: Event Signaling
keywords: [event, threading.Event, set, clear, wait, is_set, signal, flag, start gun, graceful shutdown, one to many, broadcast]
category: Concurrency
related: [condition-variables, locks, threading-basics, producer-consumer, semaphores]
---
# Event Signaling

Reach for `Event` for simple one-to-many boolean signalling: a "start gun" for workers, or a shutdown flag. It wraps an internal flag; when set, **all** waiters wake at once.

```python
import threading, time

start_event = threading.Event()         # flag starts False

def worker(i):
    print(f"worker {i} waiting...")
    start_event.wait()                  # blocks until flag is True (returns immediately if already set)
    print(f"worker {i} running!")

for i in range(3):
    threading.Thread(target=worker, args=(i,)).start()

time.sleep(2)
start_event.set()                       # flips flag True -> wakes ALL waiters at once
```

## API

```python
e = threading.Event()
e.set()          # flag = True, wake every waiter
e.clear()        # flag = False (future wait() calls block again)
e.wait()         # block until True
e.wait(timeout=5)# returns True if flagged, False on timeout — check the return!
e.is_set()       # peek without blocking
```

## Graceful shutdown pattern

```python
stop = threading.Event()

def poller():
    while not stop.is_set():
        do_work()
        stop.wait(1.0)                  # sleeps 1s but wakes instantly when stop.set() is called

# main thread:
stop.set()                              # tells the loop to exit
```

Gotchas: `Event` is one-to-many and level-triggered (waiters that call `wait()` after `set()` don't block). If you need to pass data or wait on a compound predicate, use a [Condition](#condition-variables) or [queue.Queue](#queue-module) instead.

---
id: daemon-threads
title: Daemon Threads
keywords: [daemon thread, daemon flag, background thread, non-daemon, thread exit, program exit, abrupt termination, setDaemon, "Thread(daemon=True)", isDaemon, heartbeat, poller]
category: Concurrency
type: concept
related: [threading-basics, subclassing-thread, sentinel-shutdown, thread-pool, producer-consumer, gil]
---
# Daemon Threads

By default threads are **non-daemon**: the program will not exit until every non-daemon thread finishes. A **daemon** thread runs in the background and does **not** keep the program alive.

```python
import threading, time

def background_poller():
    while True:                     # infinite loop, never returns
        print("Polling for updates...")
        time.sleep(1)

# daemon MUST be set before start() (or via setter on the instance)
daemon_thread = threading.Thread(target=background_poller, daemon=True)
daemon_thread.start()

time.sleep(2.5)
print("Main exiting. Daemon thread is killed abruptly.")
# Program exits here -> background_poller dies immediately.
```

Use daemons for background work that should die with the process: heartbeats, pollers, cache refreshers, background GC.

Key rules:
```python
t = threading.Thread(target=fn, daemon=True)  # set at construction, or:
t.daemon = True                                # set before t.start()
# t.daemon = True after start() -> RuntimeError: cannot set daemon status of active thread
print(t.daemon)                                # inspect flag
# A thread inherits the daemon flag of the thread that creates it (main is non-daemon).
```

Gotcha — abrupt termination: daemon threads are stopped instantly at interpreter exit. They get **no** chance to run `finally` blocks, close files, flush buffers, or finish DB transactions. Only use them where sudden death is safe.

For work that must finish or clean up, use a **non-daemon** thread with `join()`, or a [sentinel-based graceful shutdown](#sentinel-shutdown) instead.

```python
# Non-daemon: main blocks until worker completes
t = threading.Thread(target=fn)   # daemon=False (default)
t.start(); t.join()               # guaranteed to finish
```

See [threading-basics](#threading-basics) and [producer-consumer](#producer-consumer).

---
id: subclassing-thread
title: Subclassing Thread
keywords: [subclass thread, "threading.Thread", override run, custom thread, run method, "super().__init__()", stateful thread, thread class, start, join, target vs subclass]
category: Concurrency
related: [threading-basics, daemon-threads, thread-exceptions, classes, producer-consumer, thread-pool]
---
# Subclassing Thread

Passing `target=fn` is fine for simple work. For stateful threads (need to store attributes / return results), subclass `threading.Thread` and override `run()`.

```python
import threading, urllib.request

class DownloaderThread(threading.Thread):
    def __init__(self, url):
        super().__init__()          # MUST call parent __init__ first!
        self.url = url
        self.bytes_downloaded = 0   # per-instance state

    def run(self):                  # body runs in the new thread when start() is called
        print(f"Starting download from {self.url}")
        with urllib.request.urlopen(self.url) as response:
            data = response.read()
        self.bytes_downloaded = len(data)   # stash result on self

downloader = DownloaderThread("http://example.com")
downloader.start()                  # spawns thread, invokes run() -- NEVER call run() directly
downloader.join()                   # wait; then read the result
print(f"Total bytes: {downloader.bytes_downloaded}")
```

Rules:
- Only override `__init__()` and `run()`. Do **not** override `start()` or `join()` — that breaks internal thread bookkeeping.
- Always call `super().__init__()` in your `__init__`, or you get `RuntimeError: thread.__init__() not called`.
- `start()` schedules `run()` on a new thread; calling `run()` directly just executes it synchronously in the current thread (no concurrency).
- Threads can't return values directly — store them on `self` and read after `join()`, or push to a `queue.Queue`.

Set daemon / name via the constructor state before starting:
```python
class Worker(threading.Thread):
    def __init__(self, name):
        super().__init__(name=name, daemon=True)   # pass Thread kwargs up
    def run(self):
        ...
```

For catching failures inside `run()`, see [thread-exceptions](#thread-exceptions). For lifecycle basics see [threading-basics](#threading-basics) and [daemon-threads](#daemon-threads).

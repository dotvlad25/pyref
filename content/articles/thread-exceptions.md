---
id: thread-exceptions
title: Exception Handling in Threads
keywords: [thread exception, exception in thread, "threading.excepthook", uncaught exception, exception propagation, error queue, thread error handling, sys.stderr, join exception, catch thread error]
category: Concurrency
related: [threading-basics, subclassing-thread, exception-handling, producer-consumer, queue-module, thread-pool, future-objects]
---
# Exception Handling in Threads

An unhandled exception in a thread's `target` (or `run()`) **terminates only that thread**. The traceback prints to `sys.stderr`, but the exception does **not** propagate to the main thread — `join()` returns normally and the program keeps running.

```python
import threading

def boom():
    raise ValueError("worker failed")

t = threading.Thread(target=boom)
t.start()
t.join()            # NO exception raised here; traceback just printed to stderr
print("main keeps going")   # this still runs
```

Pattern 1 — pass the error back via a `queue.Queue` (put the result OR the exception object):

```python
import threading, queue

def risky_task(result_queue):
    try:
        raise ValueError("Something went wrong in the worker!")
    except Exception as e:
        result_queue.put(e)          # ship the exception back to main

results = queue.Queue()
t = threading.Thread(target=risky_task, args=(results,))
t.start(); t.join()

item = results.get()
if isinstance(item, Exception):
    print(f"Main caught worker error: {item}")   # re-raise here if desired
else:
    print(f"Success: {item}")
```

Pattern 2 — `threading.excepthook` (Python 3.8+): a global hook for *uncaught* thread exceptions. Great for centralized logging.

```python
import threading

def custom_hook(args):
    # args has: exc_type, exc_value, exc_traceback, thread
    print(f"Logger: {args.exc_type.__name__} in thread {args.thread.name}")

threading.excepthook = custom_hook

def failing_task():
    raise RuntimeError("Unexpected failure!")

t = threading.Thread(target=failing_task, name="Worker-1")
t.start(); t.join()   # hook fires instead of default stderr dump
```

Tip: with [ThreadPoolExecutor](#thread-pool), a worker's exception is captured in its [Future](#future-objects) and re-raised when you call `future.result()` — no manual queue needed.

See [exception-handling](#exception-handling) and [producer-consumer](#producer-consumer).

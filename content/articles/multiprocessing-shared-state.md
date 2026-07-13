---
id: multiprocessing-shared-state
title: "Sharing State Between Processes"
keywords: [multiprocessing, shared state, ipc, multiprocessing.Queue, Value, Array, get_lock, shared_memory, SharedMemory, pickle, inter-process communication, race condition, typecode]
category: Concurrency
type: concept
related: [multiprocessing, process-pool, race-conditions, locks, queue-module, gil, multiprocessing-start-methods]
---
# Sharing State Between Processes

Processes have separate memory — globals and `threading.Lock` do NOT cross the boundary. Use `multiprocessing`'s IPC primitives.

## Queue — pass pickled objects over an OS pipe

```python
import multiprocessing

def worker(q):
    item = q.get()
    q.put(f"Processed: {item}")

if __name__ == '__main__':
    q = multiprocessing.Queue()          # process-safe (queue.Queue is NOT)
    p = multiprocessing.Process(target=worker, args=(q,))
    p.start()
    q.put("Raw Data")
    print(q.get())                       # -> Processed: Raw Data
    p.join()
```

## Value / Array — shared-memory primitives with a lock

```python
def inc(shared_val):
    with shared_val.get_lock():          # built-in lock prevents races
        shared_val.value += 1

if __name__ == '__main__':
    counter = multiprocessing.Value('i', 0)          # 'i'=int, 'd'=double
    arr = multiprocessing.Array('i', [0, 1, 2, 3])   # fixed-size typed array
    ps = [multiprocessing.Process(target=inc, args=(counter,)) for _ in range(100)]
    for p in ps: p.start()
    for p in ps: p.join()
    print(counter.value)                 # 100 (thanks to get_lock)
```

Typecodes match `array` module: `'i'` int, `'d'` double, `'b'` byte. Without `get_lock()` concurrent writes overwrite each other — same as thread [race-conditions](#race-conditions). For mutable Python objects (dict/list), use a `multiprocessing.Manager()` proxy: `m = Manager(); d = m.dict()` — slower (each op is a serialized IPC round-trip via a server process) but flexible.

## shared_memory — zero-copy for large buffers (3.8+)

```python
from multiprocessing import shared_memory
shm = shared_memory.SharedMemory(create=True, size=1024)  # raw buffer
shm.buf[0] = 42
other = shared_memory.SharedMemory(name=shm.name)          # attach by name in another process
print(other.buf[0])                                        # 42
other.close(); shm.close(); shm.unlink()                   # unlink ONCE to free
```

Best for large datasets (e.g. NumPy arrays) to avoid pickling overhead. Prefer Queues over shared+locks when you can — safer and simpler. See [process-pool](#process-pool) for CPU-bound pools.

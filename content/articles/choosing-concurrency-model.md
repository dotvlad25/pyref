---
id: choosing-concurrency-model
title: Choosing a Concurrency Model
keywords: [choosing concurrency, threading vs multiprocessing vs asyncio, decision guide, cpu bound, io bound, cpu-bound, io-bound, gil, thread pool, process pool, event loop, blocking, synchronous library, aiohttp, requests, hybrid, tradeoffs, which to use]
category: Concurrency
type: concept
related: [gil, concurrency-vs-parallelism, threading-basics, thread-pool, multiprocessing, process-pool, asyncio-basics, run-in-executor, asyncio-to-thread, blocking-the-event-loop]
---
# Choosing a Concurrency Model

Match the model to the bottleneck. Wrong choice = slower-than-serial, race conditions, or needless complexity. **Profile first** (is it CPU or I/O?).

```python
# Decision tree:
# CPU-bound (heavy math, image/JSON parsing, ML) --------> multiprocessing
# I/O-bound + async libraries available (aiohttp) -------> asyncio
# I/O-bound + only sync/legacy libraries (requests) -----> threading
```

## The three scenarios

| Workload | Use | Why | Watch out |
|---|---|---|---|
| **Heavy CPU** | `ProcessPoolExecutor` | separate GIL per process → true parallelism | memory + IPC (pickle) overhead; use few big tasks |
| **Massive I/O** (10k+ conns) | `asyncio` | cooperative, 1 thread, tiny per-task cost | one blocking call freezes the loop; needs async libs |
| **Moderate I/O + sync libs** | `ThreadPoolExecutor` | GIL released during I/O; use familiar sync code | race conditions on shared mutable state |

```python
# CPU-bound: bypass the GIL
from concurrent.futures import ProcessPoolExecutor
with ProcessPoolExecutor(max_workers=4) as ex:      # ~os.cpu_count()
    results = list(ex.map(cpu_task, items))

# I/O-bound, sync lib (requests, boto3, psycopg2): threads
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=50) as ex:      # 50-100 for I/O
    results = list(ex.map(fetch_url, urls))

# I/O-bound, async lib (aiohttp): asyncio
import asyncio
async def main():
    await asyncio.gather(*(fetch_async(u) for u in urls))
```

## Tradeoffs at a glance

```python
# threading:       shared memory (fast handoff) BUT no CPU parallelism + races
# multiprocessing: real parallelism BUT copy memory + slow pickle IPC
# asyncio:         scales to huge I/O BUT all-or-nothing (no blocking calls)
```

## Hybrid: combine them

I/O + CPU pipeline? Run I/O in [asyncio](#asyncio-basics), offload CPU work to a process pool via [run_in_executor](#run-in-executor) so the event loop never blocks (see [blocking the event loop](#blocking-the-event-loop)).

```python
loop = asyncio.get_running_loop()
raw = await download(name)                           # I/O on the loop
out = await loop.run_in_executor(process_pool, cpu_task, raw)  # CPU off-loop
```

Prefer the high-level pool executors over raw `Thread`/`Process`; pass data via queues, not shared globals. See [concurrency vs parallelism](#concurrency-vs-parallelism) and [the GIL](#gil).

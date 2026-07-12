---
id: concurrency-vs-parallelism
title: Concurrency vs Parallelism
keywords: [concurrency, parallelism, interleaving, simultaneous, cores, gil, cpu bound, io bound, cpu-bound, io-bound, cooperative, preemptive, threading, multiprocessing, asyncio, single thread]
category: Concurrency
type: concept
related: [gil, choosing-concurrency-model, multiprocessing, threading-basics, asyncio-basics, multiprocessing-start-methods]
---
# Concurrency vs Parallelism

**Concurrency** = *dealing* with many tasks at once by interleaving them (progress overlaps in time). **Parallelism** = *doing* many tasks at the exact same instant — requires multiple CPU cores.

```python
# Concurrency: one chef chopping, pausing to stir, back to chopping.
#   -> tasks make progress in overlapping periods, NOT simultaneously.
# Parallelism: two chefs, one chopping + one stirring at the same moment.
#   -> needs real hardware (multiple cores).
# Parallelism implies concurrency; concurrency does NOT imply parallelism.
```

## The GIL caps CPython parallelism

Only one thread executes Python bytecode at a time (see [the GIL](#gil)). So threads/asyncio give **concurrency**, not parallelism, for pure-Python code.

```python
# threading  -> concurrency (preemptive: OS scheduler switches threads)
# asyncio    -> concurrency (cooperative: tasks yield at 'await', single thread)
# multiprocessing -> TRUE parallelism (separate processes, each its own GIL)
```

| Model | Concurrent? | Parallel? | Switching |
|---|---|---|---|
| `threading` | ✅ | ❌ (GIL) | preemptive (OS) |
| `asyncio` | ✅ | ❌ (1 thread) | cooperative (`await`) |
| `multiprocessing` | ✅ | ✅ | separate OS processes |

## Why it matters

```python
# CPU-bound (heavy loops/math): threads give NO speedup -> need parallelism
#   -> multiprocessing bypasses the GIL with separate interpreters.
# I/O-bound (network/disk/DB): GIL is released while waiting
#   -> concurrency alone (threads or asyncio) overlaps the waiting = big win.
# Exception: C extensions (NumPy, Pillow) release the GIL -> real parallelism.
```

Pick the model by workload — see [choosing a concurrency model](#choosing-concurrency-model).

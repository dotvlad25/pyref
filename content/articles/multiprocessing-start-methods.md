---
id: multiprocessing-start-methods
title: Process Start Methods (spawn vs fork)
keywords: [spawn, fork, forkserver, start method, set_start_method, get_context, __main__, main guard, re-import, reimport, recursive spawning, RuntimeError, multiprocessing, copy-on-write, pickle, windows, macos, linux]
category: Concurrency
related: [multiprocessing, process-pool, multiprocessing-shared-state, choosing-concurrency-model, concurrency-vs-parallelism, gil]
---
# Process Start Methods (spawn vs fork)

How a new process is created differs by OS. This drives startup cost, what state is inherited, and why the `__main__` guard is mandatory.

```python
# 'spawn'  : start a fresh Python interpreter; re-imports the main module,
#            re-pickles target + args. Slower start, clean state.
#            DEFAULT on Windows and macOS (3.8+).
# 'fork'   : clone parent process via os.fork(); child inherits memory
#            copy-on-write (fast, no re-import). DEFAULT on Linux.
#            Unsafe with threads/locks held; being deprecated as default.
# 'forkserver': a helper server forks clean children (Unix only).
```

## The `if __name__ == '__main__'` guard

With **spawn**, the child re-imports your main module. Without the guard, module-level process-spawning code runs again in the child → infinite recursive spawning.

```python
import multiprocessing, time

def work(name, n):
    total = sum(i * i for i in range(n))
    print(f"{name} done: {total}")

if __name__ == '__main__':      # REQUIRED for spawn (Windows/macOS)
    # Without this guard, each spawned child re-imports the module and
    # spawns MORE children -> RuntimeError / fork bomb.
    p = multiprocessing.Process(target=work, args=("A", 10_000_000))
    p.start()
    p.join()
```

## Choosing / inspecting the method

```python
import multiprocessing as mp

mp.set_start_method("spawn")     # set ONCE, at program start, in __main__
# set_start_method twice -> RuntimeError; use a context for a local override:
ctx = mp.get_context("spawn")    # doesn't touch global default
p = ctx.Process(target=work, args=("B", 100))
```

## Consequences

```python
# spawn: target function + all args must be picklable (sent to child).
#        Memory is COPIED immediately -> higher RAM, no shared globals.
# fork:  inherits parent memory copy-on-write -> cheap reads of big data,
#        but a lock/thread held at fork time can leave the child deadlocked.
```

Applies equally to [ProcessPoolExecutor](#process-pool). See [multiprocessing](#multiprocessing) and [sharing state](#multiprocessing-shared-state).

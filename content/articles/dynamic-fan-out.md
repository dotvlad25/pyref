---
id: dynamic-fan-out
title: Dynamic Fan-Out (Tasks That Spawn Tasks)
keywords: [dynamic fan out, recursive parallelism, tasks spawn tasks, growing future set, wait first_completed, as_completed pending set, parallel tree traversal, work discovered at runtime, thread pool expanding]
category: Concurrency
type: pattern
related: [futures-wait, as-completed, thread-pool, future-objects, bounded-concurrency]
---
# Dynamic Fan-Out (Tasks That Spawn Tasks)

When the work isn't known up front — each task **discovers more work** as it runs (tree/graph traversal, expanding a frontier) — you can't pre-submit a fixed list. Instead, keep a **live set of pending futures** and grow it as results come in. Drain by completion with [`wait(FIRST_COMPLETED)`](#futures-wait) so newly-submitted tasks are picked up on the next round.

```python
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED
import os

def tree_size(root, max_workers=8):
    """Total size of a directory tree — one task per directory, fanned out
    as subdirectories are discovered."""
    def scan(path):                              # unit of work
        total, subdirs = 0, []
        with os.scandir(path) as it:
            for e in it:
                if e.is_dir(follow_symlinks=False):
                    subdirs.append(e.path)
                elif e.is_file(follow_symlinks=False):
                    total += e.stat().st_size
        return total, subdirs

    grand_total = 0
    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        pending = {ex.submit(scan, root)}
        while pending:
            done, pending = wait(pending, return_when=FIRST_COMPLETED)
            for fut in done:
                size, subdirs = fut.result()
                grand_total += size
                for d in subdirs:
                    pending.add(ex.submit(scan, d))   # fan out on discovery
    return grand_total
```

## Why a live set, not a fixed list

`ThreadPoolExecutor.map` and a one-shot `as_completed(fixed_list)` assume you know every task before starting. Here tasks are created mid-flight, so the loop:

1. **waits** for at least one future to finish (`FIRST_COMPLETED`),
2. **processes** those results — which may submit new futures,
3. **repeats** on the remaining + newly-added set until it's empty.

`wait` returns `not_done` as a fresh set you can add to before the next call, which is exactly what dynamic work needs.

## as_completed variant (batch rounds)

[`as_completed`](#as-completed) also works, but its generator is tied to the set passed in — you can't add to *that* iteration, so you collect the next round separately:

```python
pending = {ex.submit(scan, root)}
while pending:
    next_round = set()
    for fut in as_completed(pending):
        size, subdirs = fut.result()
        for d in subdirs:
            next_round.add(ex.submit(scan, d))
    pending = next_round
```

Prefer the `wait(FIRST_COMPLETED)` form — it processes each result the instant it lands instead of waiting for the whole round.

## Pitfalls

- **`while pending and as_completed(pending):`** is a bug — `as_completed(...)` returns a generator that is *always truthy* and gets discarded, so the clause is a no-op. Loop on the set's own truthiness (`while pending:`).
- **Termination:** the loop ends when no task adds new work. If the graph has cycles, dedup discovered items (a `visited` set) or it never terminates.
- **Unbounded growth:** the pending set can balloon if tasks fan out faster than they complete. Cap the pool ([bounded concurrency](#bounded-concurrency)) and/or the pending size.
- **Shared state:** if the *tasks themselves* touch shared data you need a lock; here `scan` is pure and only the main loop mutates `grand_total`, so none is needed.

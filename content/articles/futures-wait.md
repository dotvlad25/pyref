---
id: futures-wait
title: concurrent.futures.wait
keywords: [wait, concurrent.futures, FIRST_COMPLETED, ALL_COMPLETED, FIRST_EXCEPTION, done not_done, timeout, futures, as_completed vs wait, DoneAndNotDoneFutures]
category: Concurrency
type: reference
related: [as-completed, future-objects, thread-pool, dynamic-fan-out, run-in-executor]
---
# concurrent.futures.wait

`wait(futures, timeout=None, return_when=ALL_COMPLETED)` blocks until futures reach a condition, then returns a `(done, not_done)` pair of **sets**. Unlike [`as_completed`](#as-completed) (which *yields* futures one by one), `wait` returns in a single call — ideal when you want to react to a batch and keep the rest pending.

```python
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED

with ThreadPoolExecutor() as ex:
    futures = {ex.submit(work, x) for x in items}
    done, not_done = wait(futures, return_when=FIRST_COMPLETED)
    # done: futures finished so far; not_done: still running
```

## return_when

```python
from concurrent.futures import ALL_COMPLETED, FIRST_COMPLETED, FIRST_EXCEPTION

wait(fs)                                    # default ALL_COMPLETED: block until all finish
wait(fs, return_when=FIRST_COMPLETED)       # return as soon as ANY finishes
wait(fs, return_when=FIRST_EXCEPTION)       # return on first failure (else all done)
```

- **`ALL_COMPLETED`** (default) — `done` = all, `not_done` = empty (unless timeout hit).
- **`FIRST_COMPLETED`** — returns after ≥1 finishes; `not_done` holds the rest.
- **`FIRST_EXCEPTION`** — returns when one raises; if none do, behaves like ALL_COMPLETED.

## timeout returns partial results

```python
done, not_done = wait(futures, timeout=0.2)
# done: whatever finished within 0.2s; not_done: the stragglers (still running!)
```

`wait` does **not** cancel `not_done` on timeout — those tasks keep running. `wait` also never raises the futures' exceptions; inspect each via `fut.result()` / `fut.exception()`.

## wait vs as_completed

| | `wait` | [`as_completed`](#as-completed) |
|---|---|---|
| returns | `(done, not_done)` sets, once | generator, yields as each finishes |
| use when | react to a batch, keep rest pending | stream results one by one |
| dynamic fan-out | ideal (loop on `not_done`) | awkward (set changes mid-iteration) |

## The FIRST_COMPLETED loop (dynamic work)

When tasks discover *more* tasks, loop on the pending set — see [dynamic fan-out](#dynamic-fan-out):

```python
pending = {ex.submit(scan, root)}
while pending:
    done, pending = wait(pending, return_when=FIRST_COMPLETED)
    for fut in done:
        for new_item in fut.result():
            pending.add(ex.submit(scan, new_item))
```

Reassigning `pending = not_done` each round is safe because it's a fresh set — you can add new futures to it before the next `wait`.

---
id: asyncio-locks
title: asyncio Sync Primitives
keywords: [asyncio.Lock, asyncio.Semaphore, asyncio.Event, async with, critical section, race condition, await boundary, synchronization, mutex, signaling, condition]
category: Concurrency
related: [asyncio-basics, asyncio-queue, threading-basics, coroutines, asyncio-timeouts]
---
# asyncio Sync Primitives

`asyncio` mirrors the `threading` primitives, but they are **awaited** — they yield to the event loop instead of blocking the OS thread. You need them less than with threads (one coroutine runs at a time), but a race can still happen when state is mutated **across an `await` boundary**.

## `asyncio.Lock` — protect a critical section

```python
import asyncio

class BankAccount:
    def __init__(self):
        self.balance = 0
        self.lock = asyncio.Lock()

    async def deposit(self, amount):
        async with self.lock:            # await-acquire; only one task inside
            current = self.balance
            await asyncio.sleep(0.01)     # context switch — but lock blocks others
            self.balance = current + amount

async def main():
    acct = BankAccount()
    await asyncio.gather(*(acct.deposit(10) for _ in range(100)))
    print(acct.balance)                  # reliably 1000
```

Without the lock, tasks read the same `current` during the `await` and updates are lost (~10, not 1000). Keep the locked block small.

## `asyncio.Semaphore` — cap concurrency

```python
sem = asyncio.Semaphore(3)               # at most 3 at once

async def fetch(url):
    async with sem:                      # 4th waiter yields until a slot frees
        return await download(url)
```

Ideal for limiting concurrent connections/requests when firing many tasks.

## `asyncio.Event` — one-to-many signaling

```python
started = asyncio.Event()

async def waiter():
    await started.wait()                 # sleeps until the flag is set
    print("go!")

async def setter():
    await asyncio.sleep(1)
    started.set()                        # wakes ALL waiters
```

- `set()` wakes every current and future waiter; `clear()` resets; `is_set()` checks.
- These are **not** thread-safe — use only within one event loop. For cross-thread work use `queue`/`threading` primitives. See [asyncio.Queue](#asyncio-queue) for producer-consumer.

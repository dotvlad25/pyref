---
id: web-crawler-ratelimit
title: Web Crawler (Rate Limiting)
keywords: [web crawler, rate limit, rate limiting, throttle, crawl delay, min interval, token bucket, semaphore, politeness, monotonic, sleep outside lock, requests per second, concurrency vs rate]
category: Concurrency
related: [web-crawler-robots, web-crawler-threadpool, web-crawler-asyncio, semaphores, locks, blocking-the-event-loop, race-conditions]
---
# Web Crawler (Rate Limiting)

Adds politeness *timing* to the [robots.txt crawler](#web-crawler-robots). Two distinct constraints are often conflated:

- **Concurrency limit** — max requests *in flight*. That's just [`max_workers`](#thread-pool) or a [`Semaphore`](#semaphores). Already handled.
- **Rate limit** — max requests *per unit time* (e.g. 1 req/sec, or robots.txt `Crawl-delay`). This needs new machinery.

Single host → one shared limiter, called right before each fetch.

## Min-interval limiter

```python
import threading, time

class RateLimiter:
    """At most one request per `min_interval` seconds, across all threads."""
    def __init__(self, min_interval: float):
        self.min_interval = min_interval
        self.lock = threading.Lock()
        self.next_slot = 0.0

    def acquire(self) -> None:
        with self.lock:
            now = time.monotonic()
            slot = max(now, self.next_slot)   # reserve my timestamp
            self.next_slot = slot + self.min_interval
        delay = slot - time.monotonic()
        if delay > 0:
            time.sleep(delay)                 # sleep OUTSIDE the lock
```

In the worker, gate the fetch:

```python
rate.acquire()
links = provider.get_links(url)
```

## The key subtlety

**Reserve the slot under the lock, then sleep outside it.** The naive version sleeps *while holding* the lock:

```python
# WRONG — serializes everything: thread B can't even compute its slot
# until thread A wakes up and releases the lock.
with self.lock:
    wait = self.next_slot - time.monotonic()
    if wait > 0:
        time.sleep(wait)
    self.next_slot = time.monotonic() + self.min_interval
```

Grabbing a unique future timestamp atomically, releasing the lock, then waiting for *your own* slot lets N threads line up staggered (0s, 1s, 2s…) and wait **in parallel**. Use `time.monotonic()`, not `time.time()`, so a wall-clock adjustment can't break the spacing.

## Source the interval from robots.txt

`robotparser` exposes the delay directly:

```python
delay = robots.crawl_delay(user_agent) if robots else None
rate = RateLimiter(delay or default_delay)
```

## Token bucket — for burst tolerance

A min-interval limiter forbids bursts. A token bucket allows up to `capacity` requests to fire immediately, then throttles to the refill rate:

```python
import threading, time

class TokenBucket:
    def __init__(self, rate: float, capacity: float):
        self.rate = rate            # tokens added per second
        self.capacity = capacity    # max burst size
        self.tokens = capacity
        self.updated = time.monotonic()
        self.lock = threading.Lock()

    def acquire(self) -> None:
        while True:
            with self.lock:
                now = time.monotonic()
                self.tokens = min(self.capacity,
                                  self.tokens + (now - self.updated) * self.rate)
                self.updated = now
                if self.tokens >= 1:
                    self.tokens -= 1
                    return
                deficit = (1 - self.tokens) / self.rate
            time.sleep(deficit)     # wait outside the lock, then retry
```

Prefer the min-interval limiter unless bursts are explicitly wanted — it's simpler and usually enough.

## Asyncio version

Same structure, but async primitives — and never `time.sleep`, which would [block the event loop](#blocking-the-event-loop):

```python
async def acquire(self):
    async with self.lock:                 # asyncio.Lock
        now = loop.time()
        slot = max(now, self.next_slot)
        self.next_slot = slot + self.min_interval
    delay = slot - loop.time()
    if delay > 0:
        await asyncio.sleep(delay)         # NOT time.sleep
```

The progression: concurrency vs rate → min-interval limiter → reserve-then-sleep → robots `Crawl-delay` → token bucket for bursts.

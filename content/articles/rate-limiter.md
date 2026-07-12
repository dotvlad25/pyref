---
id: rate-limiter
title: Rate Limiter (Fixed / Sliding / Token Bucket)
keywords: [rate limiter, rate limiting, fixed window, sliding window log, token bucket, requests per second, allow_request, throttle, per user limit, boundary burst, deque, defaultdict]
category: Patterns
type: solution
related: [sliding-window, deque, defaultdict, per-key-locking, web-crawler-ratelimit, ordereddict]
---
# Rate Limiter (Fixed / Sliding / Token Bucket)

Admit or deny requests so each key (user, IP, API token) gets at most `N` per `T` seconds. Three standard algorithms, in increasing precision.

## Fixed window — simplest

Count requests per aligned time window; reset when the window rolls over.

```python
import time

class FixedWindowRateLimiter:
    def __init__(self, max_requests, window_seconds):
        self.max = max_requests
        self.window = window_seconds
        self.state = {}                        # key -> (window_start, count)

    def allow(self, key):
        now = time.time()
        start = now - (now % self.window)      # align to the current window
        wstart, count = self.state.get(key, (start, 0))
        if wstart != start:                    # new window -> reset
            wstart, count = start, 0
        if count < self.max:
            self.state[key] = (wstart, count + 1)
            return True
        return False
```

**The edge case:** a key can send `N` at `0:59` and `N` more at `1:00` — `2N` in ~1 second, because the counter resets on the boundary. O(1) time and memory, but bursty.

## Sliding window log — exact

Store the timestamp of each allowed request; count only those within the last `T` seconds. Use a [`deque`](#deque) so pruning old entries is **O(1)** (a list's `pop(0)` is O(n)).

```python
import time
from collections import defaultdict, deque

class SlidingWindowRateLimiter:
    def __init__(self, max_requests, window_seconds):
        self.max = max_requests
        self.window = window_seconds
        self.hits = defaultdict(deque)         # key -> timestamps

    def allow(self, key):
        now = time.time()
        cutoff = now - self.window
        q = self.hits[key]
        while q and q[0] <= cutoff:            # drop expired timestamps
            q.popleft()                        # O(1) with deque
        if len(q) < self.max:
            q.append(now)
            return True
        return False
```

No boundary burst — the window truly slides. Cost: stores up to `max` timestamps per key.

## Token bucket — allows controlled bursts

Each key has a bucket that refills at `max/window` tokens per second, up to a cap. Each request spends one token. O(1) memory per key (no timestamp list).

```python
import time

class TokenBucketRateLimiter:
    def __init__(self, max_requests, window_seconds):
        self.cap = max_requests
        self.rate = max_requests / window_seconds     # tokens per second
        self.buckets = {}                              # key -> (tokens, last_time)

    def allow(self, key):
        now = time.time()
        tokens, last = self.buckets.get(key, (self.cap, now))
        tokens = min(self.cap, tokens + (now - last) * self.rate)   # refill
        if tokens >= 1:
            self.buckets[key] = (tokens - 1, now)
            return True
        self.buckets[key] = (tokens, now)
        return False
```

## Choosing

| Algorithm | Precision | Memory/key | Bursts |
|---|---|---|---|
| Fixed window | approximate | O(1) | 2N at boundary |
| Sliding log | exact | O(N) | none |
| Token bucket | smooth | O(1) | up to capacity |

Reach for **sliding log** when the limit must be strict, **token bucket** when short bursts are acceptable and memory matters. To make any of these safe under concurrent calls, see [per-key locking](#per-key-locking). For *spacing out* your own outbound requests instead of admitting inbound ones, see [crawler rate limiting](#web-crawler-ratelimit).

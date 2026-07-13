---
id: web-crawler-futures
title: Web Crawler (Futures-Set Variants)
keywords: [web crawler, leetcode 1236, threadpoolexecutor, as_completed, wait, first_completed, futures set, same host, crawl, concurrent bfs, dynamic fan out]
category: Concurrency
type: solution
related: [web-crawler-threadpool, dynamic-fan-out, futures-wait, as-completed, web-crawler, url-parsing]
---
# Web Crawler (Futures-Set Variants)

A compact concurrent crawler (LeetCode 1236 shape): visit every URL reachable from `startUrl` on the same host, using a **growing set of futures** instead of a `queue.Queue` + worker loop (the [threadpool version](#web-crawler-threadpool)). This is the [dynamic fan-out](#dynamic-fan-out) pattern — each fetch discovers more URLs to fetch.

## Version A — `as_completed` per round

Closest to the common compact solution, but uses `as_completed` for its real purpose (process futures as they finish):

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List

class Solution:
    def crawl(self, startUrl: str, htmlParser: 'HtmlParser') -> List[str]:
        host = startUrl.split('/')[2]                 # 'http://host/path' -> host
        same_host = lambda u: u.split('/')[2] == host

        visited = {startUrl}
        with ThreadPoolExecutor(max_workers=10) as ex:
            pending = {ex.submit(htmlParser.getUrls, startUrl)}
            while pending:
                next_round = set()
                for fut in as_completed(pending):      # yields as each finishes
                    for url in fut.result():
                        if url not in visited and same_host(url):
                            visited.add(url)
                            next_round.add(ex.submit(htmlParser.getUrls, url))
                pending = next_round
        return list(visited)
```

## Version B — `wait(FIRST_COMPLETED)` streaming

Never rebuilds a batch; reacts to whatever finishes next. See [`wait`](#futures-wait).

```python
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED
from typing import List

class Solution:
    def crawl(self, startUrl: str, htmlParser: 'HtmlParser') -> List[str]:
        host = startUrl.split('/')[2]
        same_host = lambda u: u.split('/')[2] == host

        visited = {startUrl}
        with ThreadPoolExecutor(max_workers=10) as ex:
            futures = {ex.submit(htmlParser.getUrls, startUrl)}
            while futures:
                done, futures = wait(futures, return_when=FIRST_COMPLETED)
                for fut in done:
                    for url in fut.result():
                        if url not in visited and same_host(url):
                            visited.add(url)
                            futures.add(ex.submit(htmlParser.getUrls, url))
        return list(visited)
```

## Correctness points

- **Dedup at enqueue, single-threaded coordination.** Only the main loop touches `visited`, so no lock is needed — the pool threads just run `getUrls`. A URL is added to `visited` the moment it's discovered, so it's fetched at most once (handles the cyclic link graph).
- **`visited` seeds with `startUrl`** so the seed isn't re-submitted.
- **Termination:** the set empties when no fetch yields an unseen same-host URL.

## Common pitfall: `as_completed` in the loop condition

A frequently-seen version writes:

```python
while dq and as_completed(dq):          # BUG: no-op condition
    curr = dq.popleft().result()
```

`as_completed(dq)` returns a **generator, which is always truthy**, and the value is discarded — so the clause does nothing; the loop is really `while dq:`. It still *works* only because `.result()` blocks, but it processes strictly in FIFO submission order and the `as_completed` import is misleading. Use `as_completed`/`wait` for their actual purpose, as above.

## Note on the host check

`url.split('/')[2]` extracts the host from a well-formed `http://host/...` (fine for LeetCode's guaranteed inputs). For real URLs use [`urllib.parse.urlparse(url).hostname`](#url-parsing) — it lowercases, strips `user:pass@` and `:port`, and won't misfire on missing schemes. For the production-shaped crawler with a `queue.Queue` and worker pool, see the [threadpool crawler](#web-crawler-threadpool).

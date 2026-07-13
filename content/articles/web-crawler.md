---
id: web-crawler
title: Web Crawler (Same-Host BFS)
keywords: [web crawler, crawler, same host, hostname, bfs, frontier, seen set, dedup, visited, urlparse, deque, single threaded, link graph, scrape]
category: Patterns
type: solution
related: [web-crawler-threadpool, web-crawler-asyncio, web-crawler-robots, bfs, deque, url-parsing, thread-pool, set]
---
# Web Crawler (Same-Host BFS)

Crawl every unique page reachable from a start URL, staying on the same hostname. Start with this single-threaded version — correct and simple — then parallelize if needed.

The design is just [BFS](#bfs) over the link graph: a [`deque`](#deque) frontier and a `seen` [set](#set) that doubles as both the dedup guard and the result. A URL is added to `seen` the instant it's discovered, so it's fetched at most once. No locks are needed because nothing runs concurrently.

```python
from collections import deque
from urllib.parse import urlparse

Url = str

class LinkProvider:
    def get_links(self, url: Url) -> list[Url]:
        """Return the outgoing links found on the given page."""
        raise NotImplementedError

def get_hostname(url: Url) -> str:
    # "https://site.com/blog/article-1" -> "site.com"
    return urlparse(url).hostname or ""

def crawl_same_host(start_url: Url, provider: LinkProvider) -> set[Url]:
    """All unique URLs reachable from start_url on the same host (inclusive)."""
    host = get_hostname(start_url)

    seen: set[Url] = {start_url}          # dedup guard AND result set
    frontier: deque[Url] = deque([start_url])

    while frontier:
        url = frontier.popleft()          # popleft = BFS; pop() would be DFS
        try:
            for link in provider.get_links(url):
                if get_hostname(link) != host:
                    continue              # off-host -> skip
                if link not in seen:      # first time discovered
                    seen.add(link)
                    frontier.append(link)
        except Exception:
            pass                          # a bad page shouldn't abort the crawl

    return seen
```

## Key decisions

- **Add to `seen` on discovery, not on visit** — prevents the same URL being queued twice before it's processed (the classic BFS dedup rule).
- **`urlparse(url).hostname`**, not `.netloc` — `hostname` is lowercased and strips any `user:pass@` and `:port`, so host comparison is clean. See [URL parsing](#url-parsing).
- **Swallow per-page errors** so one dead link/timeout doesn't kill the whole crawl.
- **Dedup keys are exact strings** — `http://h/p`, `http://h/p#frag`, and `http://h/p/` won't collapse. Normalize each URL (strip the fragment, etc.) before adding to `seen`, or equivalent pages get fetched repeatedly.
- **Complexity:** O(V + E) over pages and links; O(V) space for `seen`.

## Follow-up: "make it concurrent"

Crawling is I/O-bound, so threads help despite the [GIL](#gil). See the full [multithreaded version](#web-crawler-threadpool) — it keeps this exact BFS but swaps the frontier for a thread-safe [queue](#queue-module) and guards `seen` with a lock. The one new hazard: `seen` is now shared, so guard the check-and-add.

```python
import threading

seen_lock = threading.Lock()

def should_visit(link, host, seen):
    if get_hostname(link) != host:
        return False
    with seen_lock:                       # atomic check-and-add
        if link in seen:
            return False
        seen.add(link)
        return True
```

Without the lock, two threads can both see a URL as "new" and fetch it twice — a [race condition](#race-conditions).

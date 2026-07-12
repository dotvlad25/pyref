---
id: web-crawler-robots
title: Web Crawler (robots.txt)
keywords: [web crawler, robots.txt, robotparser, robotfileparser, can_fetch, politeness, disallow, user agent, threadpool, crawler etiquette, injectable fetcher, allow all]
category: Concurrency
type: solution
related: [web-crawler-ratelimit, web-crawler-threadpool, web-crawler, web-crawler-asyncio, url-parsing, thread-pool, locks]
---
# Web Crawler (robots.txt)

Adds robots.txt compliance to the [threadpool crawler](#web-crawler-threadpool). The key simplification: `crawl_same_host` is **single-host by definition**, so there's only ever *one* robots.txt. Fetch and parse it **once, up front, single-threaded**, before launching workers. The parser is then immutable and read-only, so every worker consults it **lock-free** — no per-host cache, no robots lock (that machinery only pays off in a multi-host crawler).

**One invariant: only robots-allowed URLs ever enter the frontier.** Discovered links are gated at enqueue; the seed is checked once up front. So workers need no per-URL robots check inside the loop.

```python
import queue
import threading
from concurrent.futures import ThreadPoolExecutor
from urllib import robotparser
from urllib.parse import urlparse

Url = str
DEFAULT_USER_AGENT = "SameHostCrawler"

class LinkProvider:
    def get_links(self, url: Url) -> list[Url]:
        raise NotImplementedError

def get_hostname(url: Url) -> str:
    return urlparse(url).hostname or ""

def http_robots_fetcher(host: str, scheme: str = "https") -> str | None:
    """Fetch <scheme>://<host>/robots.txt. None on any failure -> allow-all."""
    import urllib.request
    url = f"{scheme}://{host}/robots.txt"
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            if getattr(resp, "status", 200) != 200:
                return None
            charset = resp.headers.get_content_charset() or "utf-8"
            return resp.read().decode(charset, errors="replace")
    except Exception:
        return None

def _load_robots(host, scheme, robots_fetcher):
    content = robots_fetcher(host, scheme)
    if content is None:
        return None                       # no robots.txt -> allow all
    parser = robotparser.RobotFileParser()
    parser.parse(content.splitlines())
    return parser

def crawl_same_host(start_url: Url, provider: LinkProvider, max_workers: int = 8,
                    user_agent: str = DEFAULT_USER_AGENT,
                    robots_fetcher=http_robots_fetcher) -> set[Url]:
    host = get_hostname(start_url)

    # Fetch + parse robots.txt ONCE, before any workers exist. Now immutable &
    # read-only -> workers consult it without a lock.
    scheme = urlparse(start_url).scheme or "https"
    robots = _load_robots(host, scheme, robots_fetcher)

    def allowed(url: Url) -> bool:
        return robots is None or robots.can_fetch(user_agent, url)

    # Seed disallowed: nothing to crawl. Still return it per interface contract.
    if not allowed(start_url):
        return {start_url}

    frontier: queue.Queue[Url] = queue.Queue()
    seen: set[Url] = {start_url}
    lock = threading.Lock()               # still needed: `seen` is shared
    frontier.put(start_url)

    def worker() -> None:
        while True:
            url = frontier.get()
            if url is None:
                frontier.task_done()
                return
            try:
                for link in provider.get_links(url):
                    if get_hostname(link) != host:
                        continue
                    if not allowed(link):          # gate at discovery
                        continue                  # disallowed -> never enqueued
                    with lock:
                        is_new = link not in seen
                        if is_new:
                            seen.add(link)
                    if is_new:
                        frontier.put(link)
            except Exception:
                pass
            finally:
                frontier.task_done()

    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        for _ in range(max_workers):
            pool.submit(worker)
        frontier.join()
        for _ in range(max_workers):
            frontier.put(None)

    return seen
```

## Key points

- **Fetch robots once, up front → lock-free reads.** Because it's a single host, there's exactly one robots.txt. Parsing it before workers start makes the parser immutable, so `can_fetch` needs no lock. The [`seen` lock](#locks) is still required — that's mutable shared state; robots is not.
- **Gate at discovery, enforce one invariant.** Disallowed links never enter `seen`/frontier, so they're both excluded from the result *and* never fetched. Workers skip per-URL robots checks entirely — the invariant already guarantees every queued URL is allowed.
- **`urllib.robotparser`** is stdlib: `RobotFileParser().parse(lines)` then `can_fetch(user_agent, url)`. Missing/failed robots.txt → **allow-all** (the standard convention).
- **Injectable `robots_fetcher`** makes it testable — pass a dict-backed mock instead of hitting the network. The default fetches `http(s)://host/robots.txt`.

## Policy note

The seed is *reported* even if disallowed (interface says "include start_url") but only *crawled* if allowed. If you treat robots as authoritative over the seed too, `return set()` instead — a one-line change. The same gating layers cleanly onto the [asyncio crawler](#web-crawler-asyncio). The other half of politeness is timing — see [rate limiting](#web-crawler-ratelimit) for honoring `Crawl-delay`.

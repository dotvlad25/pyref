---
id: web-crawler-threadpool
title: Web Crawler (Multithreaded, ThreadPool)
keywords: [web crawler, multithreaded crawler, threadpoolexecutor, queue, thread safe, lock, seen set, sentinel, task_done, join, concurrent bfs, frontier, worker threads, race condition]
category: Concurrency
type: solution
related: [web-crawler, web-crawler-asyncio, web-crawler-robots, web-crawler-ratelimit, thread-pool, queue-module, locks, race-conditions]
---
# Web Crawler (Multithreaded, ThreadPool)

The concurrent evolution of the [single-threaded crawler](#web-crawler). Crawling is I/O-bound, so threads give real speedup despite the [GIL](#gil). **The BFS algorithm is identical** — concurrency only changes three things:

1. `deque` frontier → thread-safe [`queue.Queue`](#queue-module)
2. plain `seen` mutation → guarded by a [`Lock`](#locks)
3. single `while frontier` loop → N worker threads + `queue.join()` + [sentinels](#sentinel-shutdown)

```python
import queue
import threading
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse

Url = str

class LinkProvider:
    def get_links(self, url: Url) -> list[Url]:
        raise NotImplementedError

def get_hostname(url: Url) -> str:
    return urlparse(url).hostname or ""

def crawl_same_host(start_url: Url, provider: LinkProvider,
                    max_workers: int = 8) -> set[Url]:
    host = get_hostname(start_url)
    seen: set[Url] = {start_url}          # dedup guard AND result set
    frontier: queue.Queue[Url] = queue.Queue()
    frontier.put(start_url)
    lock = threading.Lock()               # protects check-and-add on `seen`

    def worker() -> None:
        while True:
            url = frontier.get()
            if url is None:               # sentinel: exit cleanly
                frontier.task_done()
                return
            try:
                for link in provider.get_links(url):
                    if get_hostname(link) != host:
                        continue
                    with lock:            # atomic check-and-add; keep scope tiny
                        is_new = link not in seen
                        if is_new:
                            seen.add(link)
                    if is_new:
                        frontier.put(link)
            except Exception:
                pass                      # a bad page shouldn't abort the crawl
            finally:
                frontier.task_done()      # feeds queue.join()

    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        for _ in range(max_workers):
            pool.submit(worker)
        frontier.join()                   # drained when every task_done() fires
        for _ in range(max_workers):      # one sentinel per worker to stop them
            frontier.put(None)

    return seen
```

## The three things that make it correct

- **Atomic check-and-add under the lock.** The base did `if link not in seen: seen.add(link)` unlocked. With threads, two workers could both see a URL as new and fetch it twice — a [race condition](#race-conditions). The lock makes decide-and-mark one atomic step. Keep the lock scope tiny: decide `is_new` inside, do the `put` outside.
- **`queue.join()` for termination.** You can't use `while not frontier.empty()` — a worker may be mid-fetch about to enqueue more. `join()` blocks until every `get()` is matched by a `task_done()`, so it only returns when the frontier is truly drained.
- **Sentinels to stop workers.** Workers block on `frontier.get()` forever. After `join()`, push one `None` per worker so each breaks its loop. See [sentinel shutdown](#sentinel-shutdown).

## Why ThreadPool (not multiprocessing)

The work is network I/O — the GIL is released during the wait, so threads run concurrently. Processes would add pickling overhead for no benefit here. Complexity is unchanged: O(V + E) time, O(V) space for `seen`. For a version that scales to more concurrent fetches and needs no lock, see the [asyncio crawler](#web-crawler-asyncio).

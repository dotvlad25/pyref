---
id: web-crawler-asyncio
title: Web Crawler (Asyncio)
keywords: [web crawler, async crawler, asyncio, asyncio queue, to_thread, event loop, coroutine, worker tasks, no lock, create_task, cancel, gather, concurrent bfs, frontier]
category: Concurrency
type: solution
related: [web-crawler, web-crawler-threadpool, asyncio-basics, asyncio-queue, asyncio-to-thread, blocking-the-event-loop, asyncio-create-task, bfs]
---
# Web Crawler (Asyncio)

The async evolution of the [single-threaded crawler](#web-crawler) — an alternative to the [threadpool version](#web-crawler-threadpool). **The BFS is identical.** Concurrency changes four things:

1. `deque` frontier → [`asyncio.Queue`](#asyncio-queue)
2. `crawl_same_host` → thin sync wrapper around an async core (keeps the `-> set[Url]` interface)
3. single `while frontier` loop → N worker coroutines + `queue.join()` + cancel
4. blocking `provider.get_links` → offloaded via [`asyncio.to_thread`](#asyncio-to-thread)

And notably: **no lock needed** (unlike the threadpool version).

```python
import asyncio
from urllib.parse import urlparse

Url = str

class LinkProvider:
    def get_links(self, url: Url) -> list[Url]:
        raise NotImplementedError

def get_hostname(url: Url) -> str:
    return urlparse(url).hostname or ""

def crawl_same_host(start_url: Url, provider: LinkProvider,
                    concurrency: int = 8) -> set[Url]:
    # thin sync wrapper so the public interface is unchanged
    return asyncio.run(_crawl(start_url, provider, concurrency))

async def _crawl(start_url: Url, provider: LinkProvider,
                 concurrency: int) -> set[Url]:
    host = get_hostname(start_url)
    seen: set[Url] = {start_url}          # dedup guard AND result set
    frontier: asyncio.Queue[Url] = asyncio.Queue()
    frontier.put_nowait(start_url)

    async def worker() -> None:
        while True:
            url = await frontier.get()
            try:
                # get_links is blocking; awaiting it directly would freeze the
                # event loop. Offload to a thread so other workers progress.
                links = await asyncio.to_thread(provider.get_links, url)
                for link in links:
                    if get_hostname(link) != host:
                        continue
                    # No lock: single-threaded event loop + no `await` between
                    # the check and the add => atomic by construction.
                    if link not in seen:
                        seen.add(link)
                        frontier.put_nowait(link)
            except Exception:
                pass                      # a bad page shouldn't abort the crawl
            finally:
                frontier.task_done()

    workers = [asyncio.create_task(worker()) for _ in range(concurrency)]
    await frontier.join()                 # drained when every task_done() fires
    for w in workers:
        w.cancel()                        # idle workers parked on get() — clean
    await asyncio.gather(*workers, return_exceptions=True)
    return seen
```

## The three things that make it correct

- **No lock — and know why.** The event loop runs one coroutine at a time, and there's **no `await` between `if link not in seen` and `seen.add(link)`**. That makes check-and-add atomic *by construction* — a coroutine can only be suspended at an `await`. The [threadpool version](#web-crawler-threadpool) needs a lock for the same lines because OS threads can preempt anywhere. Same code, safe for a different reason.
- **`asyncio.to_thread` for the blocking call.** `provider.get_links` is synchronous I/O. Calling it directly would [block the event loop](#blocking-the-event-loop) and serialize everything. Offloading to a thread lets other workers run while this one waits. See [asyncio.to_thread](#asyncio-to-thread).
- **Cancel instead of sentinels.** After `join()`, the workers are parked on `await frontier.get()`. Cancelling a coroutine there is clean — no `None` sentinels required. `gather(..., return_exceptions=True)` swallows the resulting `CancelledError`s.

## Threadpool vs asyncio here

Both are correct for this I/O-bound task. Asyncio scales to far more concurrent fetches (coroutines are cheaper than threads) and needs no lock, but requires an async-friendly structure. The [threadpool version](#web-crawler-threadpool) is simpler to reach for if the rest of your code is synchronous.

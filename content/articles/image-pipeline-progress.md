---
id: image-pipeline-progress
title: Bulk Image Pipeline (Progress & Logging)
keywords: [progress, progress tracking, logging, as_completed, when to lock, thread-safe counter, main thread, tqdm, completed count, pipeline progress, no lock needed]
category: Concurrency
related: [image-pipeline-threadpool, logging, race-conditions, as-completed, locks, thread-pool]
---
# Bulk Image Pipeline (Progress & Logging)

Adds progress reporting to the [threaded pipeline](#image-pipeline-threadpool) — the answer to *"how would you track progress?"* The whole lesson is **when you need a lock and when you don't.**

## The key insight: where does counting happen?

- The `as_completed` loop runs in the **main thread**, one item at a time. Counting completed tasks *there* needs **no lock** — it's single-threaded.
- You only need a [`Lock`](#locks) if the **worker threads themselves** update a shared progress object (e.g. reporting sub-steps within a task), because many threads touch it at once.

## Lock-free progress (count in the main thread)

```python
import logging, os
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
# reuse process_one (the unit of work) from the threaded stage

log = logging.getLogger("pipeline")

def process_all(images_dir="images", pipelines_dir="pipelines",
                output_dir="output", max_workers=None):
    images_dir, pipelines_dir, output_dir = map(Path, (images_dir, pipelines_dir, output_dir))
    output_dir.mkdir(parents=True, exist_ok=True)
    images = [p for p in sorted(images_dir.iterdir()) if p.is_file()]
    pipelines = sorted(pipelines_dir.glob("*.json"))
    pairs = [(im, pl) for im in images for pl in pipelines]
    total = len(pairs)
    max_workers = max_workers or os.cpu_count() or 4

    completed = 0
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {pool.submit(process_one, im, pl, output_dir): (im, pl)
                   for im, pl in pairs}
        for fut in as_completed(futures):
            im, pl = futures[fut]
            completed += 1                 # NO lock: as_completed loop is single-threaded
            try:
                fut.result()
                log.info("[%d/%d] ok  %s x %s", completed, total, im.name, pl.name)
            except Exception as exc:
                log.error("[%d/%d] ERR %s x %s: %s", completed, total, im.name, pl.name, exc)
    return completed
```

## Thread-safe counter (when workers report directly)

If a worker updates progress *itself* (e.g. per sub-step), many threads touch the counter concurrently — now the [lock is required](#race-conditions):

```python
import threading

class ProgressTracker:
    def __init__(self, total: int) -> None:
        self.total = total
        self._done = 0
        self._lock = threading.Lock()

    def tick(self) -> int:
        with self._lock:                   # many threads -> lock required
            self._done += 1
            return self._done
```

`self._done += 1` is a read-modify-write — not atomic — so concurrent `tick()`s without the lock would lose counts. See [race conditions](#race-conditions).

## Notes

- Use [`logging`](#logging), not `print` — it's leveled, timestamped, and thread-safe.
- In practice you'd often just wrap the `as_completed` iterator in `tqdm(as_completed(futures), total=total)` for a progress bar.
- Rule of thumb: **aggregate results where they converge** (the main thread) to avoid locking; only lock the truly shared, concurrently-mutated state.

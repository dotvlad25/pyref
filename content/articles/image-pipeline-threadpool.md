---
id: image-pipeline-threadpool
title: Bulk Image Processing Pipeline (Threaded)
keywords: [image processing, pillow, PIL, threadpool, threadpoolexecutor, as_completed, parallel, embarrassingly parallel, gil release, failure isolation, bounded memory, batch, fan out]
category: Concurrency
type: solution
related: [image-pipeline, image-pipeline-idempotency, image-pipeline-progress, image-pipeline-memory, thread-pool, as-completed, gil]
---
# Bulk Image Processing Pipeline (Threaded)

The concurrent evolution of the [sequential pipeline](#image-pipeline). Same task, refactored onto a [`ThreadPoolExecutor`](#thread-pool) to meet wall-clock and memory limits.

## Why threads work here

- **Each `(image, pipeline)` pair is independent** — embarrassingly parallel, no shared mutable state, so no locks.
- **Pillow releases the GIL** — its heavy ops run in C, so threads overlap real CPU/I-O work. (Pure-Python CPU code wouldn't speed up — you'd need [processes](#multiprocessing). See [the GIL](#gil).)
- **Memory stays bounded** — only `max_workers` images are in flight at once (each task opens its own and drops it on return), so peak ≈ `max_workers × (image + intermediates)`, *not* total images.

## Extract the unit of work

`process_one` is Stage 1's inner-loop body, lifted out so it can be submitted as a task. It reuses `apply_action` + `FORMAT_EXT` from the [sequential version](#image-pipeline) unchanged.

```python
import json
from pathlib import Path
from PIL import Image

def process_one(image_path: Path, pipeline_path: Path, output_dir: Path) -> Path:
    """Apply one pipeline to one image, save it, return the output path."""
    steps = json.loads(pipeline_path.read_text())
    img = Image.open(image_path)

    out_format = None
    for step in steps:
        if step["action"] == "save_format":
            out_format = step["format"]
        else:
            img = apply_action(img, step)

    ext = FORMAT_EXT.get(out_format.upper(), out_format.lower()) if out_format \
          else image_path.suffix.lstrip(".")
    out_path = output_dir / f"{image_path.stem}_{pipeline_path.stem}.{ext}"

    if out_format:
        save_fmt = "JPEG" if out_format.upper() in ("JPEG", "JPG") else out_format
        if save_fmt == "JPEG" and img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        img.save(out_path, format=save_fmt)   # Pillow only knows "JPEG", not "JPG"
    else:
        img.save(out_path)
    return out_path
```

## Fan out and collect

```python
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

def process_all(images_dir="images", pipelines_dir="pipelines",
                output_dir="output", max_workers=None):
    images_dir, pipelines_dir, output_dir = map(Path, (images_dir, pipelines_dir, output_dir))
    output_dir.mkdir(parents=True, exist_ok=True)

    images = [p for p in sorted(images_dir.iterdir()) if p.is_file()]
    pipelines = sorted(pipelines_dir.glob("*.json"))
    pairs = [(img, pipe) for img in images for pipe in pipelines]

    max_workers = max_workers or os.cpu_count() or 4   # GIL-releasing -> scale with cores

    failures = []
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {pool.submit(process_one, img, pipe, output_dir): (img, pipe)
                   for img, pipe in pairs}
        for i, fut in enumerate(as_completed(futures), 1):
            img, pipe = futures[fut]
            try:
                out_path = fut.result()            # re-raises this task's exception
                print(f"[{i}/{len(pairs)}] ok  {out_path.name}")
            except Exception as exc:
                failures.append((img.name, pipe.name, exc))
                print(f"[{i}/{len(pairs)}] ERR {img.name} x {pipe.name}: {exc}")
    return failures
```

## Design notes

- **`as_completed` + `.result()` isolates failures.** Calling `.result()` re-raises *that* task's exception; catching it here logs the one bad pair and keeps the batch going instead of aborting. See [as_completed](#as-completed) and [Future objects](#future-objects).
- **Map future → inputs** (`futures = {fut: (img, pipe)}`) so you can name what failed when a result comes back out of order.
- **Threads, not processes** — because Pillow releases the GIL. For pure-Python CPU work, swap to `ProcessPoolExecutor` ([multiprocessing](#multiprocessing)).
- **Eager submit caveat:** all pairs are `submit`-ted up front, creating every `Future` immediately. Fine for thousands of pairs; for millions, batch the submissions to cap the pending queue.

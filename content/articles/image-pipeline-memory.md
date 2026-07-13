---
id: image-pipeline-memory
title: Bulk Image Pipeline (Memory-Bounded)
keywords: [memory, large images, 4000x4000, memory budget, bounded concurrency, peak memory, Image.open context manager, close promptly, lazy load, Image.draft, out of memory, streaming, per image footprint]
category: Concurrency
type: solution
related: [image-pipeline-threadpool, bounded-concurrency, image-pipeline-progress, thread-pool, gil]
---
# Bulk Image Pipeline (Memory-Bounded)

Scales the [threaded pipeline](#image-pipeline-threadpool) to large images — the answer to *"what if images are 4000×4000 and you have 50 of them?"*

**The trap:** never load all images up front. A 4000×4000 RGB image is ~48 MB decoded, and intermediates push it to ~150–200 MB. Holding 50 at once ≈ 10 GB — blows a 4 GB budget.

```python
imgs = [Image.open(p).convert("RGB") for p in all_paths]   # BAD: forces every decode; peak scales with total count
```

## Four ways to keep memory bounded

1. **Stream the work.** Open each image only when its task runs; let it be freed on return. Peak ≈ `(concurrent tasks) × (per-image footprint)`, independent of how many images exist.
2. **Cap concurrency by a memory budget, not just `cpu_count`** — see [bounded concurrency](#bounded-concurrency).
3. **Close promptly** with `with Image.open(...)` — releases the *file handle* at task exit. The decoded pixel buffer is freed separately, when the local goes out of scope on `return` (CPython refcounting, no GC cycle needed).
4. **Exploit PIL's laziness.** `Image.open()` reads only the header; pixels load on first use. For downscaling JPEGs, `Image.draft()` decodes at reduced size — a big win when the output is much smaller than the source (thumbnails).

```python
import json, os
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from PIL import Image
# reuse apply_action + FORMAT_EXT from the sequential stage

def safe_worker_count(mem_budget: int, per_image: int, cpu=None) -> int:
    cpu = cpu or os.cpu_count() or 4
    return min(cpu, max(1, mem_budget // per_image))   # tightest limit wins

def process_one(image_path: Path, pipeline_path: Path, output_dir: Path) -> Path:
    steps = json.loads(pipeline_path.read_text())
    with Image.open(image_path) as img:          # context manager closes the file on exit
        out_format = None
        for step in steps:
            if step.get("action") == "save_format":
                out_format = step["format"]
            else:
                img = apply_action(img, step)
        ext = (FORMAT_EXT.get(out_format.upper(), out_format.lower())
               if out_format else image_path.suffix.lstrip("."))
        out_path = output_dir / f"{image_path.stem}_{pipeline_path.stem}.{ext}"
        if out_format:
            save_fmt = "JPEG" if out_format.upper() in ("JPEG", "JPG") else out_format
            if save_fmt == "JPEG" and img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            img.save(out_path, format=save_fmt)   # Pillow only knows "JPEG", not "JPG"
        else:
            img.save(out_path)
    return out_path

def process_all(images_dir="images", pipelines_dir="pipelines", output_dir="output",
                mem_budget=4 * 1024**3, per_image=200 * 1024**2):
    images_dir, pipelines_dir, output_dir = map(Path, (images_dir, pipelines_dir, output_dir))
    output_dir.mkdir(parents=True, exist_ok=True)
    images = [p for p in sorted(images_dir.iterdir()) if p.is_file()]
    pipelines = sorted(pipelines_dir.glob("*.json"))
    pairs = [(im, pl) for im in images for pl in pipelines]

    workers = safe_worker_count(mem_budget, per_image)   # at most `workers` decoded at once
    done = 0
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(process_one, im, pl, output_dir) for im, pl in pairs]
        for fut in as_completed(futures):
            fut.result()
            done += 1
    return {"processed": done, "workers": workers}
```

## The sizing math

Peak memory ≈ `workers × per_image`. To stay under budget: `workers = min(cpu_count, budget // per_image)`. For 4 GB and ~200 MB/image that's `min(cpu_count, 20)` — so even on a 32-core box you cap at 20 concurrent decodes, and the 50-image total never matters because only `workers` are ever in flight.

- **Estimate `per_image` from the decoded size**, not the file size — a 2 MB JPEG can be 48 MB decoded, more with intermediates.
- Streaming plus capped concurrency is what bounds memory: each task opens its own image, and its decoded buffer is reclaimed when `process_one` returns (the local's last reference drops).

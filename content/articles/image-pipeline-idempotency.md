---
id: image-pipeline-idempotency
title: Bulk Image Pipeline (Idempotent Re-runs)
keywords: [idempotent, idempotency, rerun, resume, skip existing, atomic write, os.replace, exist_ok, partial run, crash recovery, image pipeline, overwrite safe]
category: Patterns
related: [image-pipeline, image-pipeline-threadpool, atomic-writes, pathlib, json-module]
---
# Bulk Image Pipeline (Idempotent Re-runs)

Makes the [image pipeline](#image-pipeline) safe to run twice — the answer to *"what if the script is re-run, or crashed halfway?"* Four properties:

1. **Don't crash on existing dirs** — `output_dir.mkdir(parents=True, exist_ok=True)`.
2. **Overwriting is safe** — a re-run reproduces the same outputs.
3. **Optional resume** — `skip_existing` skips pairs whose output already exists, so a re-run only does the missing work (handy after a partial/crashed run).
4. **Atomic writes** — write to a temp file, then [`os.replace`](#atomic-writes) into place, so a mid-write crash never leaves a corrupt output.

```python
import json
import os
from pathlib import Path
from PIL import Image
# reuses apply_action + FORMAT_EXT from the sequential stage

def process_one(image_path: Path, pipeline_path: Path, output_dir: Path,
                skip_existing: bool = False):
    """Returns ("skipped" | "wrote", out_path)."""
    # Compute the destination FIRST, so we can skip before any expensive work.
    steps = json.loads(pipeline_path.read_text())
    out_format = next((s["format"] for s in steps if s.get("action") == "save_format"), None)
    ext = (FORMAT_EXT.get(out_format.upper(), out_format.lower())
           if out_format else image_path.suffix.lstrip("."))
    out_path = output_dir / f"{image_path.stem}_{pipeline_path.stem}.{ext}"

    if skip_existing and out_path.exists():
        return ("skipped", out_path)              # resume: don't redo finished work

    img = Image.open(image_path)
    src_format = img.format                        # capture BEFORE transforms drop it
    for step in steps:
        if step.get("action") != "save_format":
            img = apply_action(img, step)

    # Atomic write: temp file -> os.replace. A crash mid-write can't corrupt out_path.
    save_format = out_format or src_format
    if save_format and save_format.upper() in ("JPEG", "JPG"):
        save_format = "JPEG"                       # Pillow only knows "JPEG", not "JPG"
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
    tmp = out_path.with_name(out_path.name + ".tmp")
    img.save(tmp, format=save_format)              # pass format: ".tmp" hides the real ext
    os.replace(tmp, out_path)                       # atomic on the same filesystem
    return ("wrote", out_path)


def process_all(images_dir="images", pipelines_dir="pipelines", output_dir="output",
                skip_existing: bool = False):
    images_dir, pipelines_dir, output_dir = map(Path, (images_dir, pipelines_dir, output_dir))
    output_dir.mkdir(parents=True, exist_ok=True)   # (1) rerun must not crash here
    images = [p for p in sorted(images_dir.iterdir()) if p.is_file()]
    pipelines = sorted(pipelines_dir.glob("*.json"))

    wrote = skipped = 0
    for im in images:
        for pl in pipelines:
            status, _ = process_one(im, pl, output_dir, skip_existing=skip_existing)
            wrote += status == "wrote"
            skipped += status == "skipped"
    return {"wrote": wrote, "skipped": skipped}
```

## Design notes

- **Compute the output path before doing work.** Deriving `out_path` up front lets `skip_existing` bail out *before* opening/transforming the image — resume is cheap.
- **Capture `img.format` before transforming.** Operations like `convert`/`resize` return new images with `format = None`, so grab the source format first if there's no explicit `save_format`.
- **The `.tmp` extension hides the real format.** `foo.png.tmp` defeats Pillow's extension-based detection — always pass `format=...` explicitly. See [atomic writes](#atomic-writes).
- **Idempotency = safe to re-run.** With atomic writes, an interrupted run leaves only complete files; with `skip_existing`, the next run finishes exactly the pairs that are missing.

Combine with the [threaded version](#image-pipeline-threadpool): make `process_one` atomic and resumable, then fan the pairs out — each task is independently crash-safe.

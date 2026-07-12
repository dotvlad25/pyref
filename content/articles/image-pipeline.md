---
id: image-pipeline
title: Bulk Image Processing Pipeline
keywords: [image processing, pillow, PIL, batch pipeline, transform steps, resize rotate crop, config driven, dispatch, json pipeline, apply actions, cross product, save format]
category: Patterns
type: solution
related: [image-pipeline-threadpool, image-pipeline-idempotency, dispatch-table, pathlib, json-module, dict]
---
# Bulk Image Processing Pipeline

Apply every pipeline (a JSON list of transform steps) to every image, saving each result as `{image}_{pipeline}.{ext}`. Start with this sequential version — the two nested loops make the cross-product obvious — then parallelize if needed.

Requires Pillow: `pip install pillow`.

## The action dispatcher

Each transform is one step; a [dispatch function](#dispatch-table) maps `action` → behavior. (For many actions, a `dict` of handlers scales better than this `if` chain.)

```python
from PIL import Image, ImageFilter, ImageEnhance

def apply_action(img, step):
    action = step["action"]
    if action == "resize":
        return img.resize((step["width"], step["height"]))
    if action == "rotate":
        return img.rotate(step["degrees"], expand=True)
    if action == "crop":
        return img.crop((step["left"], step["top"], step["right"], step["bottom"]))
    if action == "flip":
        flip = Image.FLIP_LEFT_RIGHT if step["direction"] == "horizontal" else Image.FLIP_TOP_BOTTOM
        return img.transpose(flip)
    if action == "grayscale":
        return img.convert("L")
    if action == "blur":
        return img.filter(ImageFilter.GaussianBlur(radius=step["radius"]))
    if action == "sharpen":
        return img.filter(ImageFilter.SHARPEN)
    if action == "brightness":
        return ImageEnhance.Brightness(img).enhance(step["factor"])
    if action == "contrast":
        return ImageEnhance.Contrast(img).enhance(step["factor"])
    raise ValueError(f"unknown action: {action!r}")
```

## The driver

Uses [`pathlib`](#pathlib) for discovery and [`json`](#json-module) to load each pipeline.

```python
import json
from pathlib import Path

FORMAT_EXT = {"JPEG": "jpg", "PNG": "png", "GIF": "gif", "BMP": "bmp",
              "WEBP": "webp", "TIFF": "tiff"}

def process_all(images_dir="images", pipelines_dir="pipelines", output_dir="output"):
    images_dir, pipelines_dir, output_dir = map(Path, (images_dir, pipelines_dir, output_dir))
    output_dir.mkdir(parents=True, exist_ok=True)

    images = [p for p in sorted(images_dir.iterdir()) if p.is_file()]
    pipelines = sorted(pipelines_dir.glob("*.json"))

    for image_path in images:
        for pipeline_path in pipelines:          # cross product: every pipeline × every image
            steps = json.loads(pipeline_path.read_text())
            img = Image.open(image_path)

            out_format = None
            for step in steps:
                if step["action"] == "save_format":
                    out_format = step["format"]   # save-time directive, not a transform
                else:
                    img = apply_action(img, step)

            ext = FORMAT_EXT.get(out_format.upper(), out_format.lower()) if out_format \
                  else image_path.suffix.lstrip(".")
            out_path = output_dir / f"{image_path.stem}_{pipeline_path.stem}.{ext}"

            if out_format:
                save_fmt = "JPEG" if out_format.upper() in ("JPEG", "JPG") else out_format
                # JPEG has no alpha/palette -> convert before saving.
                if save_fmt == "JPEG" and img.mode not in ("RGB", "L"):
                    img = img.convert("RGB")
                img.save(out_path, format=save_fmt)   # Pillow only knows "JPEG", not "JPG"
            else:
                img.save(out_path)
```

## Design notes

- **Config-driven transforms.** Steps come from JSON, so new pipelines need no code change — the [dispatch table](#dispatch-table) is what makes that clean.
- **Separate transform steps from save-time directives.** `save_format` isn't an image op; handle it when writing, not in `apply_action`.
- **Format edge case.** JPEG can't store alpha or a palette — convert to `RGB` first or `save` raises.
- **Output naming** encodes both inputs (`{image}_{pipeline}`) so the full cross-product lands in one folder without collisions.

Each `(image, pipeline)` pair is independent, so this parallelizes cleanly — see the [threaded version](#image-pipeline-threadpool). The work is I/O- and C-bound (Pillow releases the GIL), so threads give real speedup.

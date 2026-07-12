---
id: stack-diffing
title: Stack Diffing (Snapshots → Enter/Exit Events)
keywords: [stack diff, sampling profiler, snapshots, trace events, start end, call stack, track by position not name, recursion, flame graph, common prefix, enter exit, denoising, confirmation window, streaming events, per-depth walk, debounce]
category: Patterns
related: [stack, state-machines, enum, tree-recursion-patterns, dict]
---
# Stack Diffing (Snapshots → Enter/Exit Events)

A sampling profiler records periodic call-stack snapshots (bottom → top). Reconstruct when each function entered and exited by **diffing consecutive snapshots**. The core insight: **track by stack *position*, not function name** — otherwise recursion collapses (three nested `solve` frames look like one).

## Diff by common prefix

Two consecutive stacks share a common prefix; everything above the first divergence changed. Emit **END** events top-down (deepest exits first) and **START** events bottom-up (parent enters before child).

```python
from typing import NamedTuple

class TraceEvent(NamedTuple):
    timestamp: int
    function: str
    depth: int
    event_type: str          # "start" or "end"

def convert(snapshots: list[list[str]]) -> list[TraceEvent]:
    events, prev = [], []
    for t, curr in enumerate(snapshots):
        # length of the shared bottom prefix (compare position by position)
        common = 0
        for i in range(min(len(prev), len(curr))):
            if prev[i] == curr[i]:
                common = i + 1
            else:
                break                         # diverged — stop; names above changed

        # END what left, deepest first
        for i in range(len(prev) - 1, common - 1, -1):
            events.append(TraceEvent(t, prev[i], i, "end"))
        # START what arrived, shallowest first
        for i in range(common, len(curr)):
            events.append(TraceEvent(t, curr[i], i, "start"))
        prev = list(curr)

    # close everything still open at the end
    for i in range(len(prev) - 1, -1, -1):
        events.append(TraceEvent(len(snapshots), prev[i], i, "end"))
    return events
```

## Why position, not name

```python
# t=1: ["main", "solve", "solve"]   two recursive frames
# t=2: ["main", "solve", "solve", "solve"]
```

Comparing `prev[i] == curr[i]` position-by-position, the depth-3 `solve` is recognized as a *new* frame while depths 1–2 are unchanged — so each recursive call gets its own start/end pair. Tracking a `set` of names would merge them.

## The three ordering rules

1. **Find the common prefix**, then everything above it changed.
2. **ENDs top-down** (deepest frame exits first — matches real call unwinding).
3. **STARTs bottom-up** (a parent must enter before its child).

## Denoising (batch): vertical per-depth walk

A short-lived function shows up in only one or two samples — profiler noise. To filter it, require a frame to persist at the same **position** for `min_samples` consecutive snapshots before emitting it. Instead of diffing row-by-row (across time), walk **column by column**: fix a depth, scan all timestamps, and find the runs of a stable function there.

```python
def convert_denoised(snapshots: list[list[str]], min_samples: int = 3) -> list[TraceEvent]:
    if not snapshots:
        return []
    max_depth = max((len(s) for s in snapshots), default=0)
    events: list[TraceEvent] = []

    for depth in range(max_depth):                 # vertical walk: one depth at a time
        run_fn, run_start, run_len = None, 0, 0
        for t, stack in enumerate(snapshots):
            fn = stack[depth] if depth < len(stack) else None
            if fn == run_fn and fn is not None:
                run_len += 1                       # same frame persists
            else:
                if run_fn is not None and run_len >= min_samples:
                    events.append(TraceEvent(run_start, run_fn, depth, "start"))
                    events.append(TraceEvent(t, run_fn, depth, "end"))
                run_fn, run_start, run_len = fn, t, (1 if fn else 0)
        if run_fn is not None and run_len >= min_samples:   # run reaching the end
            events.append(TraceEvent(run_start, run_fn, depth, "start"))
            events.append(TraceEvent(len(snapshots), run_fn, depth, "end"))

    # ENDs before STARTs at a tie; ENDs deepest-first, STARTs shallowest-first
    events.sort(key=lambda e: (e.timestamp, 0 if e.event_type == "end" else 1,
                               -e.depth if e.event_type == "end" else e.depth))
    return events
```

A run shorter than `min_samples` is silently dropped, so a `noise_fn` seen in 2 samples never produces events, while a `real_fn` seen in 4 does. The per-depth walk is what makes "same position" the unit of confirmation — recursion at different depths stays tracked separately.

## Denoising (streaming): one snapshot at a time

When snapshots arrive live (you don't have them all up front), you can't scan a whole column. Keep per-depth state and **defer** each frame: count consecutive samples, emit `start` only once it crosses the threshold, and emit `end` when a *confirmed* frame disappears.

```python
class StreamingDenoiser:
    def __init__(self, min_samples: int = 3):
        self.min = min_samples
        self.t = 0
        self.state: dict[int, list] = {}   # depth -> [fn, first_seen_t, count, confirmed]

    def push(self, stack: list[str]) -> list[TraceEvent]:
        out: list[TraceEvent] = []
        for depth, fn in enumerate(stack):
            s = self.state.get(depth)
            if s and s[0] == fn:
                s[2] += 1
                if not s[3] and s[2] >= self.min:
                    s[3] = True
                    out.append(TraceEvent(s[1], fn, depth, "start"))  # backdated to first sight
            else:
                if s and s[3]:                       # a confirmed frame ended here
                    out.append(TraceEvent(self.t, s[0], depth, "end"))
                self.state[depth] = [fn, self.t, 1, False]            # begin a pending run
        # depths that vanished this tick (stack got shorter)
        for d in [d for d in self.state if d >= len(stack)]:
            s = self.state.pop(d)
            if s[3]:
                out.append(TraceEvent(self.t, s[0], d, "end"))
        self.t += 1
        return out

    def flush(self) -> list[TraceEvent]:             # close confirmed frames at stream end
        out = [TraceEvent(self.t, s[0], d, "end")
               for d, s in sorted(self.state.items(), reverse=True) if s[3]]
        self.state.clear()
        return out
```

Two subtleties: the `start` is **backdated** to when the frame was first seen (not when it crossed the threshold), so durations stay accurate; and only *confirmed* frames emit an `end`, so noise that never confirmed also never closes. This is the incremental analogue of the batch walk — each `push` yields whatever events that one snapshot resolved.

## Related

The stack-position comparison is a specialized [stack](#stack) diff; modeling enter/exit as transitions pairs with [state machines](#state-machines), and `EventType` is a natural [enum](#enum). To visualize, emit Chrome-trace JSON (`{"ph": "B"|"E", "ts": ..., "name": ...}`) and load it in a flame-graph viewer.

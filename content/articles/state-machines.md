---
id: state-machines
title: State Machines
keywords: [state machine, finite state machine, fsm, state variable, state to handler dict, parsing, event stream, lifecycle, transition, generator parser]
category: Patterns
type: pattern
related: [dispatch-table, generator-expressions, coroutines, dict, expression-parsing, enum]
---
# State Machines

Model parsing, event streams, or object lifecycles as an explicit `state` variable plus transition rules. Two idioms: a loop with `if/elif` on the state, or a **dict mapping states to handler functions**. Making state explicit beats tangled boolean flags.

## Loop + state variable (as a generator)

Using `yield` streams completed results without buffering the whole input:

```python
from typing import Iterable, Iterator, Dict, Any

def parse_log(lines: Iterable[str]) -> Iterator[Dict[str, Any]]:
    state = "EXPECT_HEADER"
    entry: Dict[str, Any] = {}
    for line in lines:
        line = line.strip()
        if state == "EXPECT_HEADER":
            if line.startswith("START"):
                parts = line.split()
                if len(parts) < 2:
                    continue                 # malformed header — skip
                entry["id"] = parts[1]
                state = "EXPECT_BODY"        # transition
            # else: ignore junk before a START
        elif state == "EXPECT_BODY":
            if line.startswith("END"):
                yield entry                  # emit completed entry
                entry, state = {}, "EXPECT_HEADER"
            else:
                entry.setdefault("data", []).append(line)
    if state == "EXPECT_BODY" and entry:
        yield entry                          # flush truncated tail — don't drop it
```

Gotcha: handle the stream ending mid-state (the trailing `if`) or you silently lose the last partial record.

## State-to-handler dict

Scales better than a long `elif` chain; each handler returns the next state:

```python
def on_header(line, entry, out):
    if line.startswith("START"):
        entry["id"] = line.split()[1]
        return "EXPECT_BODY"
    return "EXPECT_HEADER"

def on_body(line, entry, out):
    if line.startswith("END"):
        out.append(dict(entry))       # emit completed record
        entry.clear()
        return "EXPECT_HEADER"        # back to start for the next record
    entry.setdefault("data", []).append(line)
    return "EXPECT_BODY"

HANDLERS = {"EXPECT_HEADER": on_header, "EXPECT_BODY": on_body}

state, entry, out = "EXPECT_HEADER", {}, []
for line in lines:
    state = HANDLERS[state](line.strip(), entry, out)   # every state has a handler
```

Every state a handler can return must be a key in `HANDLERS`, or the dispatch `HANDLERS[state]` raises `KeyError`. Here `on_body` loops back to `EXPECT_HEADER` on `END` so multi-record input works.

Use an [Enum](#enum) for states to avoid typo'd string bugs. This pattern also underlies tokenizers ([expression-parsing](#expression-parsing)).

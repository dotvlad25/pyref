---
id: logging
title: logging Module
keywords: [logging, logger, getLogger, basicConfig, log levels, debug info warning error critical, formatter, handler, log to file, structured logging, print vs logging, exc_info]
category: Standard Library
type: reference
related: [debugging-concurrent-code, exception-handling, image-pipeline-progress, contextlib]
---
# logging Module

The standard way to emit runtime diagnostics — leveled, configurable, and thread-safe (unlike scattered `print`s). Reach for it for progress, warnings, and errors in any non-trivial script.

```python
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("myapp")     # named logger; use __name__ in modules

log.debug("verbose detail")          # hidden (below INFO)
log.info("started, %d items", n)     # %-style args — formatted only if emitted
log.warning("retrying")
log.error("failed to open %s", path)
```

- **Levels** (low→high): `DEBUG < INFO < WARNING < ERROR < CRITICAL`. `basicConfig(level=...)` sets the threshold; anything below is dropped.
- **Lazy formatting** — pass args (`log.info("x=%s", x)`), don't pre-format (`log.info(f"x={x}")`); the string is only built if the message is actually emitted.
- **`basicConfig` is one-shot** — it configures the root logger on first call; later calls are no-ops. Set it up once at program start.

## Logging exceptions (with traceback)

```python
try:
    risky()
except Exception:
    log.exception("risky() failed")     # ERROR + full traceback
    # equivalently: log.error("...", exc_info=True)
```

## Per-module loggers

```python
log = logging.getLogger(__name__)       # e.g. "mypkg.worker"
```

Loggers form a hierarchy by dotted name and inherit config from the root, so you configure once and every module's logger obeys it.

## Log to a file

```python
logging.basicConfig(
    filename="app.log",
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
```

## Why not `print`

`logging` gives you levels (filter noise without deleting code), timestamps, module names, routing to files/syslog, and it's **thread-safe** — safe to call from many threads at once. See [debugging concurrent code](#debugging-concurrent-code) and, for progress reporting, [pipeline progress](#image-pipeline-progress).

---
id: os-module
title: os Module (System & Environment)
keywords: [os, os.cpu_count, cores, cpu count, number of cpus, os.environ, getenv, environment variables, os.getcwd, chdir, os.getpid, os.makedirs, os.remove, os.rename, os.replace, process, system, sched_getaffinity, os.urandom]
category: Standard Library
type: reference
related: [os-path, os-walk, file-metadata, atomic-writes, multiprocessing, bounded-concurrency]
---
# os Module (System & Environment)

The `os` module is the interface to the operating system — environment, processes, CPU info, and filesystem operations. (Path-string helpers live in [os.path](#os-path), directory walking in [os.walk](#os-walk), and file metadata in [file metadata](#file-metadata).)

## CPU / core count

```python
import os

os.cpu_count()            # logical CPUs (incl. hyperthreads); None if undetermined
```

The standard way to size a pool. Guard the `None` case, and prefer the *available* count on Linux (respects `taskset`/cgroup affinity), which can be lower than the total:

```python
workers = os.cpu_count() or 4                     # fallback if None
try:
    workers = len(os.sched_getaffinity(0))        # CPUs this process may run on (Linux)
except AttributeError:
    pass                                          # not available on macOS/Windows
```

This is exactly the input to [bounded concurrency](#bounded-concurrency) and [ProcessPoolExecutor](#multiprocessing) sizing.

## Environment variables

```python
os.environ["HOME"]                # KeyError if missing
os.environ.get("API_KEY")         # None if missing
os.environ.get("PORT", "8000")    # with default
os.getenv("DEBUG", "0")           # same as environ.get
os.environ["FEATURE"] = "on"      # set (affects child processes)
```

`os.environ` is a live mapping; changes propagate to subprocesses you spawn.

## Working directory & process info

```python
os.getcwd()               # current working directory
os.chdir("/tmp")          # change it
os.getpid()               # this process's id
os.getppid()              # parent process id
```

## Filesystem operations

```python
os.makedirs("a/b/c", exist_ok=True)   # create dirs recursively; no error if present
os.mkdir("d")                          # single dir; errors if it exists
os.remove("f.txt")                     # delete a file (os.unlink is an alias)
os.rmdir("emptydir")                    # remove an EMPTY dir
os.rename("old", "new")                # rename/move (fails cross-device / if target exists on Windows)
os.replace("tmp", "dst")               # like rename but atomically overwrites — see atomic-writes
os.listdir(".")                        # names in a dir (no recursion)
```

`os.replace` is the portable, overwrite-safe move — the basis of [atomic writes](#atomic-writes).

## System & misc

```python
os.urandom(16)            # cryptographically secure random bytes
os.name                   # 'posix' or 'nt' — OS family
os.getlogin()             # login name (may raise if no controlling terminal)
os.system("ls")           # run a shell command (prefer subprocess for real work)
```

For running external programs with captured output, use `subprocess`, not `os.system`. For CPU-bound parallelism sized by `cpu_count`, see [multiprocessing](#multiprocessing).

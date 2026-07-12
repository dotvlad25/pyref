---
id: in-memory-database
title: In-Memory Database (Progressive Design)
keywords: [in-memory database, key value store, undo log, transaction, rollback commit, record locking, history, modified since, versioning, progressive design]
category: Patterns
type: solution
related: [dict, defaultdict, per-key-locking, atomic-writes, state-machines]
---
# In-Memory Database (Progressive Design)

A key-value store built up in layers: CRUD → history → locking → transactions. The lesson is **extend, don't rewrite** — each layer adds a few lines. The whole "database" is a `dict`.

```python
from collections import defaultdict

class InMemoryDB:
    def __init__(self):
        self.data = {}                        # key -> value  (the database)
        self.history_log = defaultdict(list)  # key -> [(ts, value)]
        self.locks = {}                       # key -> caller_id
        self.tx = {}                          # caller_id -> [(action, key, old)]
        self._clock = 0

    def _tick(self):                          # monotonic, deterministic (not time.time)
        self._clock += 1
        return self._clock

    # --- Level 1: CRUD ---
    def set(self, key, value, caller=None):
        if key in self.locks and caller != self.locks[key]:
            return False                      # locked by someone else
        old = self.data.get(key)
        if caller in self.tx:                 # record undo entry
            self.tx[caller].append(("set", key, old))
        self.data[key] = value
        self.history_log[key].append((self._tick(), value))
        return True

    def get(self, key):
        return self.data.get(key)

    def delete(self, key, caller=None):
        if key not in self.data:
            return False
        if key in self.locks and caller != self.locks[key]:
            return False
        if caller in self.tx:
            self.tx[caller].append(("delete", key, self.data[key]))
        del self.data[key]
        self.history_log[key].append((self._tick(), None))
        return True

    # --- Level 2: history ---
    def history(self, key):
        return list(self.history_log[key])

    def modified_since(self, ts):
        return sorted(k for k, entries in self.history_log.items()
                      if any(t > ts for t, _ in entries))

    # --- Level 3: record locking ---
    def lock(self, key, caller):
        if key in self.locks:
            return self.locks[key] == caller  # idempotent for the holder
        self.locks[key] = caller
        return True

    def unlock(self, key, caller):
        if self.locks.get(key) != caller:
            return False
        del self.locks[key]
        return True

    # --- Level 4: transactions / undo ---
    def begin(self, caller):
        if caller in self.tx:
            return False
        self.tx[caller] = []
        return True

    def commit(self, caller):
        return self.tx.pop(caller, None) is not None   # discard undo log

    def rollback(self, caller):
        if caller not in self.tx:
            return False
        for action, key, old in reversed(self.tx[caller]):   # replay in reverse
            if action == "set" and old is None:
                self.data.pop(key, None)
            else:                                             # set(old) or delete
                self.data[key] = old
            self.history_log[key].append((self._tick(), self.data.get(key)))
        del self.tx[caller]
        return True
```

## Design notes

- **Level 1 is literally a dict.** Don't over-engineer the base — the value is in cleanly *extending* it.
- **Monotonic counter, not `time.time()`** — deterministic and testable, no clock skew. The same reasoning as [atomic writes](#atomic-writes) preferring stable ordering.
- **Locking is just another dict** (`key -> caller`), checked in two lines at the top of `set`/`delete` — see [per-key locking](#per-key-locking) for the concurrent version.
- **Transactions = undo log.** Record `(action, key, old_value)` before each mutation; rollback replays in reverse, commit discards the log.
- **Extend, don't refactor.** Each level is ~10 lines layered on, not a rewrite — modeling the store as an explicit set of dicts (a small [state machine](#state-machines) of caller/lock/tx state) keeps additions local.

---
id: task-manager
title: Task Manager (Dict + Heap + Lazy Deletion)
keywords: [task manager, priority queue, heapq, lazy deletion, complete task, highest priority, dict plus heap, thread safe manager, status filter, stale heap entry]
category: Patterns
type: solution
related: [heapq, lazy-deletion-heap, dict, locks, lru-cache]
---
# Task Manager (Dict + Heap + Lazy Deletion)

A task store with O(1) lookup and fast highest-priority retrieval: a **`dict` for tasks** plus a **[heap](#heapq) for priority**, using [lazy deletion](#lazy-deletion-heap) so completing a task doesn't require removing it from the middle of the heap.

```python
import heapq

class Task:
    def __init__(self, task_id, description, priority):
        self.task_id = task_id
        self.description = description
        self.priority = priority
        self.status = "pending"

class TaskManager:
    def __init__(self):
        self.tasks = {}          # task_id -> Task
        self.pq = []             # (-priority, task_id) — negate for max-heap

    def add_task(self, task_id, description, priority):
        if task_id in self.tasks:
            return False
        self.tasks[task_id] = Task(task_id, description, priority)
        heapq.heappush(self.pq, (-priority, task_id))
        return True

    def get_task(self, task_id):
        return self.tasks.get(task_id)

    def complete_task(self, task_id):
        task = self.tasks.get(task_id)
        if not task or task.status == "complete":
            return False
        task.status = "complete"        # do NOT touch the heap here
        return True

    def get_highest_priority(self):
        # Lazy deletion: skip entries whose task is gone or already complete.
        while self.pq:
            _, task_id = self.pq[0]
            task = self.tasks.get(task_id)
            if task and task.status == "pending":
                return task
            heapq.heappop(self.pq)      # stale -> discard
        return None

    def list_tasks(self, status=None):
        tasks = list(self.tasks.values())
        if status:
            tasks = [t for t in tasks if t.status == status]
        return sorted(tasks, key=lambda t: -t.priority)
```

## Why lazy deletion

`heapq` has no "remove arbitrary element" — deleting from the middle is O(n). Instead, mark the task complete in the dict and leave its stale entry in the heap; `get_highest_priority` discards stale tops when it reaches them. Amortized the heap stays proportional to live work. See [lazy deletion in heaps](#lazy-deletion-heap).

- **Negate priority** — `heapq` is a min-heap, so push `-priority` for max-first ordering. (See [heapq](#heapq).)
- **Complete = flip a flag**, not a heap edit — that's the whole point of lazy deletion.
- **Peek `self.pq[0]`** before popping so a still-valid top isn't removed.

## Thread safety

Multiple workers completing tasks concurrently need synchronization. Start with one global [lock](#locks) — correct, if coarse — wrapping each mutating method:

```python
import threading

class ThreadSafeTaskManager:
    def __init__(self):
        self._m = TaskManager()
        self._lock = threading.Lock()

    def add_task(self, *a):
        with self._lock:
            return self._m.add_task(*a)

    def complete_task(self, tid):
        with self._lock:
            return self._m.complete_task(tid)

    def get_highest_priority(self):
        with self._lock:
            return self._m.get_highest_priority()
```

A single lock serializes everything but is correct; discuss finer granularity (per-task locks, lock striping) only as an optimization if contention is the bottleneck.

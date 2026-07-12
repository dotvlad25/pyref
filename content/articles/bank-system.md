---
id: bank-system
title: Bank System (Progressive Design)
keywords: [bank system, accounts, transfer, account merge, union find, top spenders, cashback, outgoing tracking, progressive design, path compression]
category: Patterns
type: solution
related: [union-find, dict, defaultdict, heapq, in-memory-database]
---
# Bank System (Progressive Design)

Accounts built up in layers: balances → transfers → merging → rewards. The interesting move is **account merging via [union-find](#union-find)** with redirection, so operations on a merged account transparently reach its target.

```python
from collections import defaultdict

class BankSystem:
    def __init__(self):
        self.accounts = {}                       # id -> balance
        self.redirects = {}                      # id -> merged-into id
        self.outgoing = defaultdict(float)       # id -> total sent out
        self.closed = set()

    def _resolve(self, aid):                     # union-find + path compression
        path = []
        while aid in self.redirects:
            path.append(aid)
            aid = self.redirects[aid]
        for p in path:
            self.redirects[p] = aid              # compress
        return aid

    # --- Level 1: accounts ---
    def create(self, aid):
        if aid in self.accounts or aid in self.closed:
            return False
        self.accounts[aid] = 0.0
        return True

    def deposit(self, aid, amt):
        aid = self._resolve(aid)
        if amt <= 0 or aid not in self.accounts:
            return None
        self.accounts[aid] += amt
        return self.accounts[aid]

    def withdraw(self, aid, amt):
        aid = self._resolve(aid)
        if amt <= 0 or aid not in self.accounts or self.accounts[aid] < amt:
            return None
        self.accounts[aid] -= amt
        self.outgoing[aid] += amt
        return self.accounts[aid]

    def balance(self, aid):
        return self.accounts.get(self._resolve(aid))

    # --- Level 2: transfer (check funds BEFORE moving) ---
    def transfer(self, src, dst, amt):
        src, dst = self._resolve(src), self._resolve(dst)
        if amt <= 0 or src == dst:
            return False
        if src not in self.accounts or dst not in self.accounts:
            return False
        if self.accounts[src] < amt:
            return False
        self.accounts[src] -= amt
        self.accounts[dst] += amt
        self.outgoing[src] += amt
        return True

    # --- Level 3: merge (union-find) ---
    def merge(self, src, dst):
        src, dst = self._resolve(src), self._resolve(dst)
        if src == dst or src not in self.accounts or dst not in self.accounts:
            return False
        self.accounts[dst] += self.accounts[src]
        self.outgoing[dst] += self.outgoing[src]
        del self.accounts[src]
        self.closed.add(src)
        self.redirects[src] = dst                # future ops on src reach dst
        return True

    # --- Level 4: rewards ---
    def top_spenders(self, n):
        ranked = sorted(self.accounts, key=lambda a: (-self.outgoing.get(a, 0.0), a))
        return ranked[:n]

    def cashback(self, pct):
        for aid in self.accounts:
            out = self.outgoing.get(aid, 0.0)
            if out:
                self.accounts[aid] += out * pct / 100.0   # cashback is NOT outgoing
```

## Design notes

- **Merge = union-find.** `redirects` is the parent map; `_resolve` follows it with path compression → **O(log n) amortized** per resolve. (Near-O(1)/inverse-Ackermann would additionally require union by rank or size; here merges pick a fixed direction, so compression alone is the bound.) Chained merges (A→B→C) resolve transitively.
- **Resolve at every entry point** so a merged id keeps working; a self-transfer after merge (A→B then transfer A→B) correctly collapses to one account and is rejected.
- **Check funds before mutating either side** of a transfer — atomicity: never debit without a valid credit.
- **Track outgoing separately** — you can't derive spend from balance (deposits and withdrawals aren't symmetric). Cashback must *not* count as outgoing, or you'd loop.
- **Extend, don't rewrite** — same progressive discipline as the [in-memory database](#in-memory-database).

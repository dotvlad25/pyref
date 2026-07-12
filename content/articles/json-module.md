---
id: json-module
title: JSON Serialization
keywords: [json, dumps, loads, dump, load, indent, sort_keys, default, object_hook, ensure_ascii, serialize, deserialize, encode, decode, JSONDecodeError, datetime, custom encoder, parse json, pretty print]
category: Standard Library
type: reference
related: [csv-module, file-io, url-parsing]
---
# JSON Serialization

Reach for `json` to convert between Python objects and JSON text. Rule of thumb: **`s` = string** (`dumps`/`loads`), no `s` = file (`dump`/`load`).

```python
import json

# Object -> JSON string / string -> object
s = json.dumps({"name": "ann", "n": 2})   # '{"name": "ann", "n": 2}'
obj = json.loads('{"name": "ann", "n": 2}')  # {'name': 'ann', 'n': 2}
```

```python
# Straight to / from a file
with open("out.json", "w", encoding="utf-8") as f:
    json.dump(obj, f, indent=2)          # writes file, no intermediate string
with open("out.json", encoding="utf-8") as f:
    obj = json.load(f)
```

```python
# Pretty / stable output
json.dumps(obj, indent=2, sort_keys=True)      # readable, deterministic key order
json.dumps({"é": 1}, ensure_ascii=False)       # keep UTF-8 chars instead of \uXXXX
```

Type mapping: dict↔object, list↔array, str↔string, int/float↔number, `True/False`↔`true/false`, `None`↔`null`. **Tuples become arrays**, and dict keys are always coerced to strings.

```python
# default= handles otherwise-unserializable types (e.g. datetime, set)
from datetime import datetime

def encode(o):
    if isinstance(o, datetime):
        return o.isoformat()
    raise TypeError(f"not serializable: {type(o)}")

json.dumps({"ts": datetime.now()}, default=encode)
```

```python
# object_hook customizes decoding (dict -> your type)
json.loads('{"x": 1}', object_hook=lambda d: d)
```

Gotchas:
- Invalid JSON raises `json.JSONDecodeError` (subclass of `ValueError`) — catch it.
- Non-string dict keys are silently converted to strings on dump; `1` becomes `"1"`.
- JSON has no comments, trailing commas, or `NaN`/`Infinity` by default (`allow_nan=True` emits them but that's non-standard).
- For flat tabular data use [CSV](#csv-module).

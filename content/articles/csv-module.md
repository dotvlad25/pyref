---
id: csv-module
title: CSV Files
keywords: [csv, csv.reader, csv.writer, DictReader, DictWriter, writerow, writerows, delimiter, header, fieldnames, quoting, newline, tsv, tab separated, parse csv, read csv, write csv]
category: Standard Library
related: [json-module, file-io, pathlib]
---
# CSV Files

Reach for the `csv` module for delimited data — it handles quoting, embedded commas, and newlines that naive `split(",")` breaks on. **Always open files with `newline=""`** so the module controls line endings.

```python
import csv

# Read rows as lists
with open("data.csv", newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)             # first row (if any)
    for row in reader:               # row is list[str]
        print(row[0], row[1])
```

```python
# DictReader — rows as dicts keyed by header (most convenient)
with open("data.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):    # uses first line as fieldnames by default
        print(row["name"], row["age"])   # values are always str — cast as needed
```

```python
# Write lists
with open("out.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["name", "age"])      # single row
    w.writerows([["ann", 30], ["bob", 25]])  # many rows
```

```python
# DictWriter — write dicts; must declare fieldnames
with open("out.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["name", "age"])
    w.writeheader()
    w.writerow({"name": "ann", "age": 30})
```

```python
# Other delimiters (TSV) and quoting
csv.reader(f, delimiter="\t")
csv.writer(f, delimiter="\t", quoting=csv.QUOTE_MINIMAL)  # default
```

Gotchas:
- Omitting `newline=""` can produce blank rows on Windows — always set it.
- Every value read is a **string**; convert numbers explicitly (`int(row["age"])`).
- `DictWriter` raises on extra keys unless `extrasaction="ignore"`.
- For nested/structured data prefer [JSON](#json-module).

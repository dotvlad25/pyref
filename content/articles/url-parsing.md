---
id: url-parsing
title: URL Parsing
keywords: [urllib.parse, urlparse, urlsplit, urljoin, urlencode, urldefrag, parse_qs, parse_qsl, quote, unquote, query string, scheme, netloc, path, fragment, relative url, build url, crawler, ParseResult]
category: Standard Library
type: reference
related: [json-module, csv-module]
---
# URL Parsing

Reach for `urllib.parse` for anything URL-shaped — never split URLs by hand. Core: `urlparse` to break apart, `urljoin` to resolve relatives, `urlencode` to build query strings.

```python
from urllib.parse import urlparse, urljoin, urldefrag, urlencode, parse_qs

url = "https://www.example.com:8080/path/to/page?q=search&n=2#section1"
p = urlparse(url)
p.scheme    # "https"
p.netloc    # "www.example.com:8080"
p.hostname  # "www.example.com"   p.port  # 8080
p.path      # "/path/to/page"
p.query     # "q=search&n=2"
p.fragment  # "section1"
```

```python
# Resolve a relative URL against a base (crawlers)
urljoin("https://ex.com/a/b/", "../img.png")   # "https://ex.com/a/img.png"
urljoin("https://ex.com/a/b",  "c")            # "https://ex.com/a/c"

# Strip the fragment — useful to dedupe crawled URLs
clean, frag = urldefrag(url)   # clean="...?q=search&n=2", frag="section1"
```

```python
# Build a query string (handles URL-escaping for you)
urlencode({"q": "a b", "n": 2})          # "q=a+b&n=2"
urlencode({"k": [1, 2]}, doseq=True)     # "k=1&k=2"  — repeated keys

# Parse a query string back into a dict of lists
parse_qs("q=search&n=2&n=3")             # {"q": ["search"], "n": ["2", "3"]}
```

```python
from urllib.parse import quote, unquote
quote("a b/c")      # "a%20b/c"   (safe="/" by default)
unquote("a%20b")    # "a b"
```

Gotchas:
- `urljoin` treats a base ending in `/` as a directory; without `/` the last segment is replaced.
- `parse_qs` values are always **lists** (a key can repeat); use `parse_qsl` for a list of pairs.
- `urlparse` doesn't validate — a garbage string still returns a `ParseResult` with empty fields.

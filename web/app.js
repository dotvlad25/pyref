/* Python Reference — client search + rendering.
 * Loads the compact index once, searches in-memory (fuzzy, field-weighted),
 * fetches article bodies on demand. */

const els = {
  search: document.getElementById("search"),
  status: document.getElementById("status"),
  results: document.getElementById("results"),
  article: document.getElementById("article"),
  resizer: document.getElementById("resizer"),
};

/* ---------- Resizable panels ---------- */

const RESULTS_MIN = 200;
const RESULTS_MAX_MARGIN = 320;   // keep at least this many px for the article

function setResultsWidth(px) {
  const max = Math.max(RESULTS_MIN, window.innerWidth - RESULTS_MAX_MARGIN);
  const w = Math.round(Math.min(Math.max(px, RESULTS_MIN), max));
  document.documentElement.style.setProperty("--results-w", w + "px");
  return w;
}

function initResizer() {
  // Restore saved width.
  let saved;
  try { saved = parseInt(localStorage.getItem("pyref-results-w"), 10); } catch {}
  if (saved) setResultsWidth(saved);

  const r = els.resizer;
  if (!r) return;
  let dragging = false;

  const onMove = (e) => {
    if (!dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setResultsWidth(x);   // pointer x from the left edge == results width
  };
  const stop = () => {
    if (!dragging) return;
    dragging = false;
    r.classList.remove("dragging");
    document.body.classList.remove("resizing");
    const cur = getComputedStyle(document.documentElement).getPropertyValue("--results-w").trim();
    try { localStorage.setItem("pyref-results-w", parseInt(cur, 10)); } catch {}
  };
  const start = (e) => {
    dragging = true;
    r.classList.add("dragging");
    document.body.classList.add("resizing");
    e.preventDefault();
  };

  r.addEventListener("mousedown", start);
  r.addEventListener("touchstart", start, { passive: false });
  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("mouseup", stop);
  window.addEventListener("touchend", stop);

  // Double-click to reset to default.
  r.addEventListener("dblclick", () => {
    setResultsWidth(340);
    try { localStorage.setItem("pyref-results-w", 340); } catch {}
  });
}
initResizer();

let mini = null;
let byId = new Map();     // id -> index record (title, keywords, category, related)
let current = [];         // current result list (array of index records)
let activeIdx = -1;       // highlighted result index
let currentId = null;     // id of the article currently rendered
let currentQuery = "";    // latest search query (for highlighting in the article)
const ALL_TYPES = ["reference", "concept", "algo", "pattern", "solution"];
let enabledTypes = new Set(ALL_TYPES);   // which article types are shown
let renderedQuery = "";   // query that was actually highlighted in the shown article
let highlightEnabled = true;  // toggle: highlight search terms in the article body
const bodyCache = new Map();

/* ---------- Theme ---------- */

const THEMES = ["dark", "light", "sepia"];

function applyTheme(theme) {
  if (!THEMES.includes(theme)) theme = "dark";
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem("pyref-theme", theme); } catch {}
  document.querySelectorAll("#theme-switch button").forEach((b) =>
    b.classList.toggle("active", b.dataset.theme === theme)
  );
}

function initTheme() {
  let saved;
  try { saved = localStorage.getItem("pyref-theme"); } catch {}
  applyTheme(saved || "dark");
  const sw = document.getElementById("theme-switch");
  if (sw) sw.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-theme]");
    if (btn) applyTheme(btn.dataset.theme);
  });
}

// Apply theme immediately (before index loads) to avoid a flash.
initTheme();

/* ---------- Setup ---------- */

async function init() {
  els.status.textContent = "loading index…";
  const res = await fetch("/api/index");
  const data = await res.json();
  const articles = data.articles || [];

  for (const a of articles) byId.set(a.id, a);

  mini = new MiniSearch({
    fields: ["title", "keywords", "category"],
    storeFields: ["id"],
    // keywords is an array; join so it's tokenized as text.
    extractField: (doc, field) =>
      field === "keywords" ? (doc.keywords || []).join(" ") : (doc[field] || ""),
    searchOptions: {
      boost: { title: 5, keywords: 3, category: 1 },
      prefix: true,
      fuzzy: 0.2,           // light fuzzy: ~1-2 char typos (tread -> thread)
      // Rank exact term matches highest, then prefix, then fuzzy.
      weights: { fuzzy: 0.4, prefix: 0.7 },
      combineWith: "AND",
    },
  });
  mini.addAll(articles);

  els.status.textContent = `${articles.length} articles`;

  configureMarked();
  bindEvents();
  initHighlightToggle();
  initTypeFilter();
  showBrowseAll();

  // Route from the URL hash: open a bookmarked/refreshed article, else focus search.
  window.addEventListener("hashchange", routeFromHash);
  if (!routeFromHash()) els.search.focus();
}

/* Read the current hash and open that article. Returns true if it routed. */
function routeFromHash() {
  const id = decodeURIComponent((location.hash || "").replace(/^#/, ""));
  if (id && byId.has(id)) {
    loadArticle(id);
    return true;
  }
  return false;
}

function configureMarked() {
  // marked v12 dropped the `highlight` option — we highlight the rendered DOM
  // instead (see highlightCode). Blocks with no language default to Python.
  marked.setOptions({ langPrefix: "language-" });
}

function highlightCode(root) {
  root.querySelectorAll("pre code").forEach((block) => {
    const hasLang = [...block.classList].some((c) => c.startsWith("language-"));
    if (!hasLang) block.classList.add("language-python");   // default to python
    hljs.highlightElement(block);
  });
}

/* ---------- Search ---------- */

// Keep only articles whose type is currently enabled. Unknown/missing type
// counts as "reference" (the build default).
function applyRefFilter(list) {
  if (enabledTypes.size === ALL_TYPES.length) return list;   // all on -> no filtering
  return list.filter((a) => enabledTypes.has(a.type || "reference"));
}

function runSearch(q) {
  q = q.trim();
  currentQuery = q;
  if (!q) { showBrowseAll(); return; }

  const hits = mini.search(q);
  // Re-rank for "aboutness": exact id/title matches beat incidental mentions.
  const scored = hits
    .map((h) => {
      const a = byId.get(h.id);
      if (!a) return null;
      return { a, score: h.score + aboutnessBonus(a, q) };
    })
    .filter(Boolean)
    .sort((x, y) => y.score - x.score);

  current = applyRefFilter(scored.map((s) => s.a));
  activeIdx = current.length ? 0 : -1;
  renderResults(`${current.length} result${current.length === 1 ? "" : "s"}`);
  if (activeIdx >= 0) openArticle(current[0].id, false);   // auto-open: no history entry
}

// Normalize to compare across spellings: "ThreadPool" ~ "thread pool" ~ "thread-pool".
function normKey(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

// Reward articles that are ABOUT the query, not just containing it.
function aboutnessBonus(a, q) {
  const nq = normKey(q);
  if (!nq) return 0;
  let bonus = 0;
  const nid = normKey(a.id);
  const ntitle = normKey(a.title);

  if (nid === nq || ntitle === nq) bonus += 1000;          // exact hit -> always first
  else {
    if (ntitle.startsWith(nq)) bonus += 500;               // title prefix
    // whole-word match in the title
    const words = a.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    if (words.includes(q.toLowerCase())) bonus += 200;
    // exact keyword match
    if ((a.keywords || []).some((k) => normKey(k) === nq)) bonus += 120;
  }
  // Small tiebreak: prefer conceptual reference over applied solutions.
  if (a.type === "reference" || a.type === "concept") bonus += 15;
  return bonus;
}

function showBrowseAll() {
  // No query: list everything, grouped feel via category label.
  currentQuery = "";
  current = applyRefFilter(
    Array.from(byId.values()).sort((a, b) => a.title.localeCompare(b.title))
  );
  activeIdx = -1;
  renderResults(`${current.length} articles`);
}

/* ---------- Rendering ---------- */

// A small colored badge for an article's type.
function typeBadge(type) {
  const t = type || "reference";
  const label = { reference: "REF", concept: "CONCEPT", algo: "ALGO",
                  pattern: "PATTERN", solution: "SOLUTION" }[t] || t.toUpperCase();
  return `<span class="type-badge type-${escapeHtml(t)}">${label}</span>`;
}

function renderResults(statusText) {
  els.status.textContent = statusText;
  if (!current.length) {
    els.results.innerHTML = `<div class="no-results">No matches. Try fewer or shorter terms.</div>`;
    return;
  }
  els.results.innerHTML = current
    .map((a, i) => {
      const kw = (a.keywords || []).slice(0, 5).join(" · ");
      return `<div class="result ${i === activeIdx ? "active" : ""}" data-idx="${i}" data-id="${a.id}">
        <div class="r-title">${escapeHtml(a.title)} ${typeBadge(a.type)}</div>
        <div class="r-cat">${escapeHtml(a.category)}</div>
        ${kw ? `<div class="r-kw">${escapeHtml(kw)}</div>` : ""}
      </div>`;
    })
    .join("");
}

function setActive(idx) {
  if (!current.length) return;
  activeIdx = Math.max(0, Math.min(idx, current.length - 1));
  const nodes = els.results.querySelectorAll(".result");
  nodes.forEach((n, i) => n.classList.toggle("active", i === activeIdx));
  const node = nodes[activeIdx];
  if (node) node.scrollIntoView({ block: "nearest" });
}

/* Open an article and reflect it in the URL hash.
 * push=true  -> adds a history entry (explicit click/Enter/related): back/forward works.
 * push=false -> replaces the hash (search auto-open): no history spam per keystroke. */
function openArticle(id, push = true) {
  const hash = "#" + encodeURIComponent(id);
  if (location.hash === hash) {
    loadArticle(id);                       // same hash: hashchange won't fire, load directly
  } else if (push) {
    location.hash = hash;                  // fires hashchange -> loadArticle
  } else {
    history.replaceState(null, "", hash);  // silent; no hashchange
    loadArticle(id);
  }
}

async function loadArticle(id) {
  if (id === currentId) {
    // Same article already shown, but the query may have changed since it
    // rendered (search auto-opens the top result on every keystroke) — so
    // re-apply term highlighting instead of bailing out entirely.
    if (renderedQuery !== currentQuery) {
      const bodyEl = els.article.querySelector(".article-body");
      clearHighlights(bodyEl);
      highlightQueryTerms(bodyEl, currentQuery);
      renderedQuery = currentQuery;
    }
    return;
  }
  currentId = id;
  let data = bodyCache.get(id);
  if (!data) {
    els.article.innerHTML = `<div class="empty">loading…</div>`;
    const res = await fetch(`/api/article/${encodeURIComponent(id)}`);
    if (!res.ok) { els.article.innerHTML = `<div class="empty">Not found: ${escapeHtml(id)}</div>`; return; }
    data = await res.json();
    bodyCache.set(id, data);
  }
  renderArticle(data);
}

function renderArticle(data) {
  const related = (data.related || [])
    .map((rid) => {
      const r = byId.get(rid);
      const label = r ? r.title : rid;
      return `<a data-goto="${escapeHtml(rid)}">${escapeHtml(label)}</a>`;
    })
    .join("");

  // Article bodies start with their own "# Title" heading; strip a leading H1
  // so it isn't rendered twice (we inject the styled <h1> above).
  const body = String(data.body || "").replace(/^\s*#\s+.*(?:\r?\n|$)/, "");

  els.article.innerHTML = `
    <h1>${escapeHtml(data.title)}</h1>
    <div class="article-meta"><span class="cat">${escapeHtml(data.category)}</span> ${typeBadge((byId.get(data.id) || {}).type)}</div>
    <div class="article-body">${marked.parse(body)}</div>
    ${related ? `<div class="related"><h3>Related</h3>${related}</div>` : ""}
  `;
  els.article.scrollTop = 0;
  document.title = `${data.title} · pyref`;
  syncActiveResult(data.id);
  highlightCode(els.article);
  highlightQueryTerms(els.article.querySelector(".article-body"), currentQuery);
  renderedQuery = currentQuery;
  addCopyButtons();
}

// Remove previously inserted <mark> wrappers, restoring plain text nodes.
function clearHighlights(root) {
  if (!root) return;
  root.querySelectorAll("mark.search-hit").forEach((m) => {
    m.replaceWith(document.createTextNode(m.textContent));
  });
  root.normalize();   // merge adjacent text nodes so re-highlighting is clean
}

// Re-apply or clear highlights on the currently shown article (no re-fetch).
function refreshHighlights() {
  const body = els.article.querySelector(".article-body");
  if (!body) return;
  clearHighlights(body);
  if (highlightEnabled) highlightQueryTerms(body, currentQuery);
}

function initHighlightToggle() {
  const btn = document.getElementById("hl-toggle");
  if (!btn) return;
  try {
    highlightEnabled = localStorage.getItem("pyref-highlight") !== "off";
  } catch {}
  btn.classList.toggle("active", highlightEnabled);
  btn.addEventListener("click", () => {
    highlightEnabled = !highlightEnabled;
    btn.classList.toggle("active", highlightEnabled);
    try { localStorage.setItem("pyref-highlight", highlightEnabled ? "on" : "off"); } catch {}
    refreshHighlights();     // apply immediately to the open article
  });
}

function initTypeFilter() {
  const wrap = document.getElementById("type-filter");
  const btn = document.getElementById("type-filter-btn");
  const menu = document.getElementById("type-filter-menu");
  if (!wrap || !btn || !menu) return;

  const boxes = [...menu.querySelectorAll("input[data-type]")];

  // Restore saved selection.
  try {
    const saved = JSON.parse(localStorage.getItem("pyref-types") || "null");
    if (Array.isArray(saved) && saved.length) enabledTypes = new Set(saved);
  } catch {}

  const syncUI = () => {
    boxes.forEach((b) => { b.checked = enabledTypes.has(b.dataset.type); });
    // Label reflects state: "Types" (all) or "Types (3)" when filtered.
    const n = enabledTypes.size;
    btn.textContent = n === ALL_TYPES.length ? "Types ▾" : `Types (${n}) ▾`;
    btn.classList.toggle("active", n !== ALL_TYPES.length);
  };

  const commit = () => {
    try { localStorage.setItem("pyref-types", JSON.stringify([...enabledTypes])); } catch {}
    syncUI();
    runSearch(els.search.value);   // re-run current view with the new filter
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
  });

  menu.addEventListener("click", (e) => e.stopPropagation());

  boxes.forEach((b) =>
    b.addEventListener("change", () => {
      if (b.checked) enabledTypes.add(b.dataset.type);
      else enabledTypes.delete(b.dataset.type);
      if (enabledTypes.size === 0) enabledTypes.add(b.dataset.type), (b.checked = true); // never empty
      commit();
    })
  );

  menu.querySelector('[data-action="all"]').addEventListener("click", () => {
    enabledTypes = new Set(ALL_TYPES); commit();
  });
  menu.querySelector('[data-action="none"]').addEventListener("click", () => {
    enabledTypes = new Set(["reference"]); commit();   // "none" keeps reference as the useful floor
  });

  // Close on outside click / Escape.
  document.addEventListener("click", () => { menu.hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") menu.hidden = true; });

  syncUI();
}

// Wrap occurrences of each query term in <mark> across text nodes (works inside
// highlighted code too, since it runs after hljs). Safe: operates only on text
// nodes, never on tags/attributes.
function highlightQueryTerms(root, query) {
  if (!root || !query || !highlightEnabled) return;
  const terms = query
    .split(/\s+/)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))   // escape regex chars
    .filter((t) => t.length >= 2);                          // skip 1-char noise
  if (!terms.length) return;
  const alt = terms.join("|");
  const testRe = new RegExp(alt, "i");         // non-global: safe, stateless .test()
  const splitRe = new RegExp(`(${alt})`, "gi"); // global: for the replace loop

  const SKIP = new Set(["MARK", "SCRIPT", "STYLE"]);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (node.parentNode && SKIP.has(node.parentNode.nodeName)) return NodeFilter.FILTER_REJECT;
      return testRe.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const targets = [];
  while (walker.nextNode()) targets.push(walker.currentNode);

  for (const node of targets) {
    const frag = document.createDocumentFragment();
    let last = 0;
    node.nodeValue.replace(splitRe, (match, _g, offset) => {
      if (offset > last) frag.appendChild(document.createTextNode(node.nodeValue.slice(last, offset)));
      const mark = document.createElement("mark");
      mark.className = "search-hit";
      mark.textContent = match;
      frag.appendChild(mark);
      last = offset + match.length;
      return match;
    });
    if (last < node.nodeValue.length) frag.appendChild(document.createTextNode(node.nodeValue.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
}

// Highlight the open article in the results list if it's present there.
function syncActiveResult(id) {
  const idx = current.findIndex((a) => a.id === id);
  if (idx === -1) return;
  activeIdx = idx;
  const nodes = els.results.querySelectorAll(".result");
  nodes.forEach((n, i) => n.classList.toggle("active", i === activeIdx));
  const node = nodes[activeIdx];
  if (node) node.scrollIntoView({ block: "nearest" });
}

function addCopyButtons() {
  els.article.querySelectorAll("pre").forEach((pre) => {
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "copy";
    btn.addEventListener("click", () => {
      const code = pre.querySelector("code");
      navigator.clipboard.writeText(code ? code.innerText : pre.innerText);
      btn.textContent = "copied";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = "copy"; btn.classList.remove("copied"); }, 1200);
    });
    pre.appendChild(btn);
  });
}

/* ---------- Events ---------- */

function bindEvents() {
  let t;
  els.search.addEventListener("input", (e) => {
    clearTimeout(t);
    const v = e.target.value;
    // Typing means "I want to search" — close the playground if it's open.
    if (v) document.dispatchEvent(new CustomEvent("pyref:search-active"));
    t = setTimeout(() => runSearch(v), 60);
  });

  els.search.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(activeIdx + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(activeIdx - 1); }
    else if (e.key === "Enter") { e.preventDefault(); if (activeIdx >= 0) openArticle(current[activeIdx].id); }
    else if (e.key === "Escape") { els.search.value = ""; showBrowseAll(); }
  });

  els.results.addEventListener("click", (e) => {
    const node = e.target.closest(".result");
    if (!node) return;
    setActive(Number(node.dataset.idx));
    openArticle(node.dataset.id);
  });

  els.article.addEventListener("click", (e) => {
    // Related-section links.
    const goto = e.target.closest("[data-goto]");
    if (goto) {
      e.preventDefault();
      openArticle(goto.dataset.goto);
      return;
    }
    // In-body markdown links: "#id" navigates to that article; bare "#" is a no-op.
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      e.preventDefault();
      const id = decodeURIComponent(anchor.getAttribute("href").slice(1));
      if (id && byId.has(id)) openArticle(id);
    }
  });

  // Global "/" focuses search from anywhere.
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== els.search) {
      e.preventDefault();
      els.search.focus();
      els.search.select();
    }
  });
}

/* ---------- Utils ---------- */

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

init();

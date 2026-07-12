/* Playground — Monaco editor + /api/run execution.
 * Lazy-loads Monaco only when first opened, so normal search stays instant. */

(function () {
  const els = {
    panel: document.getElementById("playground"),
    btn: document.getElementById("play-btn"),
    editor: document.getElementById("pg-editor"),
    output: document.getElementById("pg-output"),
    run: document.getElementById("pg-run"),
    reset: document.getElementById("pg-reset"),
    clear: document.getElementById("pg-clear"),
    close: document.getElementById("pg-close"),
    status: document.getElementById("pg-status"),
  };

  const BOILERPLATE = `"""Scratch playground — type Python and press Ctrl/Cmd+Enter to run."""
from collections import defaultdict, deque, Counter
import heapq
import itertools
import math


def main() -> None:
    # your code here
    print("hello from pyref")


if __name__ == "__main__":
    main()
`;

  let monacoEditor = null;
  let monacoLoading = null;

  // Map app theme -> Monaco theme.
  function monacoTheme() {
    const t = document.documentElement.getAttribute("data-theme");
    return t === "light" || t === "sepia" ? "vs" : "vs-dark";
  }

  // Keep Monaco's theme in sync when the user switches app theme.
  const themeSwitch = document.getElementById("theme-switch");
  if (themeSwitch) {
    themeSwitch.addEventListener("click", () => {
      if (window.monaco) window.monaco.editor.setTheme(monacoTheme());
    });
  }

  function loadMonaco() {
    if (window.monaco) return Promise.resolve(window.monaco);
    if (monacoLoading) return monacoLoading;
    monacoLoading = new Promise((resolve, reject) => {
      const loader = document.createElement("script");
      loader.src = "/vendor/monaco/vs/loader.js";
      loader.onload = () => {
        window.require.config({ paths: { vs: "/vendor/monaco/vs" } });
        window.require(["vs/editor/editor.main"], () => resolve(window.monaco));
      };
      loader.onerror = () => reject(new Error("Failed to load Monaco"));
      document.body.appendChild(loader);
    });
    return monacoLoading;
  }

  function savedCode() {
    try { return localStorage.getItem("pyref-playground-code"); } catch { return null; }
  }
  function saveCode(v) {
    try { localStorage.setItem("pyref-playground-code", v); } catch {}
  }

  async function ensureEditor() {
    if (monacoEditor) return monacoEditor;
    els.editor.innerHTML = `<div class="pg-loading">loading editor…</div>`;
    const monaco = await loadMonaco();
    els.editor.innerHTML = "";
    monacoEditor = monaco.editor.create(els.editor, {
      value: savedCode() || BOILERPLATE,
      language: "python",
      theme: monacoTheme(),
      fontSize: 14,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      renderWhitespace: "selection",
    });
    // Ctrl/Cmd+Enter runs.
    monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);
    monacoEditor.onDidChangeModelContent(() => saveCode(monacoEditor.getValue()));
    return monacoEditor;
  }

  function setStatus(text, kind) {
    els.status.textContent = text || "";
    els.status.className = "pg-status" + (kind ? " " + kind : "");
  }

  function renderOutput(data) {
    els.output.textContent = "";
    const out = data.stdout || "";
    const err = data.stderr || "";
    if (out) {
      const s = document.createElement("span");
      s.textContent = out;
      els.output.appendChild(s);
    }
    if (err) {
      const s = document.createElement("span");
      s.className = "pg-err";
      s.textContent = err;
      els.output.appendChild(s);
    }
    if (!out && !err) {
      const s = document.createElement("span");
      s.className = "pg-hint";
      s.textContent = data.timed_out ? "(no output before timeout)" : "(no output)";
      els.output.appendChild(s);
    }
  }

  async function run() {
    if (!monacoEditor) return;
    const code = monacoEditor.getValue();
    setStatus("running…", "running");
    els.run.disabled = true;
    const t0 = performance.now();
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        renderOutput({ stderr: `Request failed: HTTP ${res.status}` });
        setStatus("error", "err");
        return;
      }
      const data = await res.json();
      renderOutput(data);
      const ms = Math.round(performance.now() - t0);
      if (data.timed_out) setStatus(`timed out (${ms} ms)`, "err");
      else if (data.returncode === 0) setStatus(`done in ${ms} ms`, "ok");
      else setStatus(`exit ${data.returncode} (${ms} ms)`, "err");
    } catch (e) {
      renderOutput({ stderr: String(e) });
      setStatus("error", "err");
    } finally {
      els.run.disabled = false;
    }
  }

  async function open() {
    els.panel.hidden = false;
    els.btn.classList.add("active");
    if (location.hash !== "#play") history.pushState(null, "", "#play");
    await ensureEditor();
    monacoEditor.focus();
  }

  function close() {
    els.panel.hidden = true;
    els.btn.classList.remove("active");
    if (location.hash === "#play") history.pushState(null, "", location.pathname);
  }

  function resetCode() {
    if (monacoEditor) {
      monacoEditor.setValue(BOILERPLATE);
      monacoEditor.focus();
    }
  }

  // Wire events.
  els.btn.addEventListener("click", () => (els.panel.hidden ? open() : close()));
  els.run.addEventListener("click", run);
  els.reset.addEventListener("click", resetCode);
  els.clear.addEventListener("click", () => {
    els.output.innerHTML = `<span class="pg-hint">Output cleared.</span>`;
    setStatus("");
  });
  els.close.addEventListener("click", close);

  // Esc closes the playground (only when it's open and Monaco isn't capturing).
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.panel.hidden) {
      e.preventDefault();
      close();
    }
  });

  // Hash routing: #play opens the playground (bookmark/refresh/back-forward).
  function routePlayground() {
    if (location.hash === "#play") open();
    else if (!els.panel.hidden) close();
  }
  window.addEventListener("hashchange", routePlayground);
  // On load, honor #play (defer so app.js's own hash handling settles first).
  if (location.hash === "#play") setTimeout(open, 0);

  // Typing in the search box means the user wants results — close the playground.
  document.addEventListener("pyref:search-active", () => {
    if (!els.panel.hidden) close();
  });
})();

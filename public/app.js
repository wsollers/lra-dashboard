const state = {
  data: null,
  proofOnly: false,
  query: "",
};

const els = {
  generated: document.getElementById("generated"),
  totalIssues: document.getElementById("totalIssues"),
  proofIssues: document.getElementById("proofIssues"),
  errorIssues: document.getElementById("errorIssues"),
  repoCount: document.getElementById("repoCount"),
  volumeBars: document.getElementById("volumeBars"),
  codeBars: document.getElementById("codeBars"),
  issueRows: document.getElementById("issueRows"),
  proofOnly: document.getElementById("proofOnly"),
  search: document.getElementById("search"),
};

async function loadData() {
  try {
    const response = await fetch("data/dashboard-data.json", { cache: "no-store" });
    if (!response.ok) throw new Error("dashboard-data.json not found");
    return await response.json();
  } catch (_err) {
    const response = await fetch("data/dashboard-data.sample.json", { cache: "no-store" });
    return await response.json();
  }
}

function filteredIssues() {
  const query = state.query.trim().toLowerCase();
  return state.data.issues.filter((issue) => {
    if (state.proofOnly && !issue.proof_related) return false;
    if (!query) return true;
    return [issue.repo, issue.severity, issue.code, issue.path, issue.message]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function renderBars(target, counts, limit = 12) {
  const entries = Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
  const max = Math.max(1, ...entries.map((entry) => entry[1]));
  target.innerHTML = entries
    .map(([label, count]) => {
      const width = Math.round((count / max) * 100);
      return `
        <div class="bar">
          <span title="${escapeHtml(label)}">${escapeHtml(label)}</span>
          <div class="barTrack"><div class="barFill" style="width:${width}%"></div></div>
          <strong>${count}</strong>
        </div>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderTable(issues) {
  els.issueRows.innerHTML = issues
    .map((issue) => {
      const path = issue.line ? `${issue.path}:${issue.line}` : issue.path;
      return `
        <tr>
          <td><a href="${escapeHtml(issue.url)}">${escapeHtml(issue.repo.split("/").pop())}#${escapeHtml(issue.number)}</a></td>
          <td class="severity-${escapeHtml(issue.severity)}">${escapeHtml(issue.severity)}</td>
          <td>${escapeHtml(issue.code)}</td>
          <td class="path">${escapeHtml(path)}</td>
          <td>${escapeHtml(issue.message || issue.title)}</td>
        </tr>
      `;
    })
    .join("");
}

function render() {
  const issues = filteredIssues();
  const totals = state.data.totals;
  els.generated.textContent = `Generated ${new Date(state.data.generated_at).toLocaleString()} from ${state.data.state} validator issues.`;
  els.totalIssues.textContent = issues.length;
  els.proofIssues.textContent = issues.filter((issue) => issue.proof_related).length;
  els.errorIssues.textContent = issues.filter((issue) => issue.severity === "error").length;
  els.repoCount.textContent = Object.keys(totals.by_repo || {}).length;
  renderBars(els.volumeBars, countBy(issues, "volume"), 16);
  renderBars(els.codeBars, countBy(issues, "code"), 14);
  renderTable(issues);
}

els.proofOnly.addEventListener("change", (event) => {
  state.proofOnly = event.target.checked;
  render();
});

els.search.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

loadData()
  .then((data) => {
    state.data = data;
    render();
  })
  .catch((err) => {
    els.generated.textContent = `Unable to load dashboard data: ${err.message}`;
  });

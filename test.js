const JOBS = [
  {
    id: 1,
    title: "Junior Business Analyst",
    company: "FintechX",
    location: "Kuala Lumpur",
    salaryMin: 4000,
    salaryMax: 4500,
    posted: "2 days ago",
    skills: ["Requirements", "UAT", "SQL", "Agile"],
    description: "Assist in gathering user requirements...",
    deadline: "2026-03-20",
    isAvailable: true
  },
  {
    id: 2,
    title: "Business Analyst (Courts System)",
    company: "MyJustice Tech",
    location: "Kuala Lumpur",
    salaryMin: 3500,
    salaryMax: 3800,
    posted: "5 days ago",
    skills: ["BRD", "Stakeholder", "Testing", "Documentation"],
    description: "Analyze court-related system requirements...",
    deadline: "2026-03-18",
    isAvailable: true
  },
  {
    id: 3,
    title: "Java Developer",
    company: "Hitachi eBworx",
    location: "Kuala Lumpur",
    salaryMin: 6000,
    salaryMax: 6500,
    posted: "1 day ago",
    skills: ["Java", "Spring", "REST", "MySQL"],
    description: "Develop backend applications...",
    deadline: "2026-03-25",
    isAvailable: true
  },
  {
    id: 4,
    title: "UI/UX Designer",
    company: "Silverlake",
    location: "Selangor",
    salaryMin: 4500,
    salaryMax: 4800,
    posted: "7 days ago",
    skills: ["Figma", "Wireframes", "Prototyping"],
    description: "Design UI/UX...",
    deadline: "2026-03-15",
    isAvailable: true
  },
  {
    id: 5,
    title: "Data Analyst",
    company: "RetailIQ",
    location: "Penang",
    salaryMin: 4000,
    salaryMax: 4200,
    posted: "3 days ago",
    skills: ["Python", "SQL", "Power BI"],
    description: "Interpret data...",
    deadline: "2026-03-19",
    isAvailable: true
  },
  {
    id: 6,
    title: "Backend Developer (Node.js)",
    company: "CloudNine",
    location: "Remote",
    salaryMin: 7500,
    salaryMax: 8000,
    posted: "4 days ago",
    skills: ["Node.js", "PostgreSQL", "API"],
    description: "Develop backend services...",
    deadline: "2026-03-22",
    isAvailable: true
  },
  {
    id: 7,
    title: "QA Engineer",
    company: "TestWorks",
    location: "Perak",
    salaryMin: 3800,
    salaryMax: 4000,
    posted: "6 days ago",
    skills: ["Selenium", "Test Plan", "Bug Tracking"],
    description: "Ensure software quality...",
    deadline: "2026-03-10",
    isAvailable: false
  },
  {
    id: 8,
    title: "Product Intern",
    company: "LaunchPad Labs",
    location: "Kuala Lumpur",
    posted: "2 days ago",
    skills: ["Research", "Documentation", "Communication"],
    description: "Support product discovery...",
    deadline: "2026-03-30",
    isAvailable: true
  },
  {
    id: 9,
    title: "Operations Associate",
    company: "FlatPay Co",
    location: "Kuala Lumpur",
    salaryMin: 5000,
    salaryMax: 5000,
    posted: "1 day ago",
    skills: ["Operations", "Excel"],
    description: "Fixed-salary band role for testing min=max filter.",
    deadline: "2026-04-01",
    isAvailable: true
  }
];

const keywordEl = document.getElementById("keyword");
const minSalaryEl = document.getElementById("minSalary");
const maxSalaryEl = document.getElementById("maxSalary");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("countText");
const perfEl = document.getElementById("perf");

const ACCEPTABLE_MS = 200;

/** No keyword and no salary (matches search_script.js). */
const MSG_NEED_INPUT = "Please enter a keyword or a salary range to search.";

const ERR_INVALID_SALARY =
  "Please enter a valid salary range using numbers only.";

const ERR_MIN_GT_MAX =
  "Minimum salary cannot be higher than maximum salary. Please enter a valid salary range.";

/** Shown in UI when filters match nothing (matches search_script.js tone). */
const MSG_NO_MATCHES =
  "No job listings found for the selected keyword/salary range.";

const normalize = (s) => String(s ?? "").trim().toLowerCase();

function toSalary(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

function hasSalaryInfo(job) {
  return Number.isFinite(job.salaryMin) && Number.isFinite(job.salaryMax);
}

function isSalaryMatch(job, minSalary, maxSalary) {
  if (minSalary === null && maxSalary === null) return true;
  if (!hasSalaryInfo(job)) return false;
  const rangeMin = minSalary === null ? Number.NEGATIVE_INFINITY : minSalary;
  const rangeMax = maxSalary === null ? Number.POSITIVE_INFINITY : maxSalary;
  return job.salaryMin >= rangeMin && job.salaryMax <= rangeMax;
}

function setStatus(type, msg) {
  statusEl.className = "status " + (type === "error" ? "error" : "ok");
  statusEl.textContent = msg;
  statusEl.style.display = "block";
}

function clearStatus() {
  statusEl.style.display = "none";
  statusEl.textContent = "";
  statusEl.className = "status";
}

function showPerf(ms, count) {
  perfEl.style.display = "block";
  perfEl.textContent =
    `Response time: ${ms.toFixed(2)} ms • Results: ${count} • ${ms <= ACCEPTABLE_MS ? "Acceptable" : "Slow"}`;
}

function hidePerf() {
  perfEl.style.display = "none";
  perfEl.textContent = "";
}

function highlight(text, kw) {
  if (!kw) return escapeHtml(text);
  const safe = escapeHtml(text);
  const k = escapeRegExp(kw);
  return safe.replace(new RegExp(`(${k})`, "ig"), "<mark>$1</mark>");
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * True if normalized keyword appears in job title, company, or any skill (partial match).
 */
function keywordMatchesJob(job, kwNormalized) {
  if (!kwNormalized) return false;
  const title = normalize(job.title);
  const company = normalize(job.company);
  const skills = job.skills.map(normalize);
  return (
    title.includes(kwNormalized) ||
    company.includes(kwNormalized) ||
    skills.some(s => s.includes(kwNormalized))
  );
}

/**
 * Same behavior as search_script.js: keyword and/or salary; optional salary narrows results.
 */
function searchJobs(rawKeyword, rawMinSalary, rawMaxSalary) {
  const kw = normalize(rawKeyword);
  const minSalary = toSalary(rawMinSalary);
  const maxSalary = toSalary(rawMaxSalary);

  if (Number.isNaN(minSalary) || Number.isNaN(maxSalary)) {
    return { error: ERR_INVALID_SALARY, results: [] };
  }

  if (minSalary !== null && maxSalary !== null && minSalary > maxSalary) {
    return { error: ERR_MIN_GT_MAX, results: [] };
  }

  if (!kw && minSalary === null && maxSalary === null) {
    return { error: MSG_NEED_INPUT, results: [] };
  }

  const matched = JOBS.filter(job => {
    const keywordMatch = !kw || keywordMatchesJob(job, kw);
    const salaryMatch = isSalaryMatch(job, minSalary, maxSalary);
    return keywordMatch && salaryMatch;
  });

  return { error: null, results: matched };
}

function initials(name) {
  const parts = String(name).trim().split(/\s+/);
  return ((parts[0]?.[0] || "?") + (parts[1]?.[0] || "")).toUpperCase();
}

function formatSalary(job) {
  if (job.salaryMin && job.salaryMax) {
    return `RM ${job.salaryMin.toLocaleString()} - RM ${job.salaryMax.toLocaleString()}/mo`;
  }
  return "Salary not specified";
}

function goToJobDetails(jobId) {
  window.location.href = `job-details.html?id=${jobId}`;
}

function renderResults(list, rawKeyword) {
  resultsEl.innerHTML = "";

  list.forEach(job => {
    const card = document.createElement("div");
    card.className = "job clickable-card";

    const skillsHtml = job.skills
      .map(s => `<span class="tag">${highlight(s, rawKeyword.trim())}</span>`)
      .join("");

    card.innerHTML = `
      <div class="left">
        <div class="avatar">${initials(job.company)}</div>
        <div>
          <h4>${highlight(job.title, rawKeyword.trim())}</h4>
          <div class="meta">
            <span>${highlight(job.company, rawKeyword.trim())}</span> •
            <span>${job.location}</span> •
            <span class="tag">${formatSalary(job)}</span>
          </div>
          <div class="tags">${skillsHtml}</div>
        </div>
      </div>
      <div class="right">
        <button class="btn-view">View Details</button>
      </div>
    `;

    card.querySelector(".btn-view").addEventListener("click", (e) => {
      e.stopPropagation();
      goToJobDetails(job.id);
    });

    card.addEventListener("click", () => {
      goToJobDetails(job.id);
    });

    resultsEl.appendChild(card);
  });
}

function handleSearch() {
  clearStatus();
  hidePerf();

  const input = keywordEl.value;
  const minSalaryInput = minSalaryEl.value;
  const maxSalaryInput = maxSalaryEl.value;

  const t0 = performance.now();
  const { error, results } = searchJobs(input, minSalaryInput, maxSalaryInput);
  const t1 = performance.now();

  if (error) {
    setStatus("error", error);
    resultsEl.innerHTML = `<div class="empty">Enter a keyword and/or salary range (see hints above).</div>`;
    countEl.textContent = "0 jobs";
    showPerf(t1 - t0, 0);
    return;
  }

  if (results.length === 0) {
    setStatus("error", MSG_NO_MATCHES);
    countEl.textContent = "0 jobs";
    resultsEl.innerHTML = `<div class="empty">No results found. Try adjusting your keyword or salary range.</div>`;
    showPerf(t1 - t0, 0);
    return;
  }

  setStatus("ok", `Showing ${results.length} job(s) that match your filters.`);
  countEl.textContent = `${results.length} job${results.length === 1 ? "" : "s"}`;
  renderResults(results, input);
  showPerf(t1 - t0, results.length);
}

function handleClear() {
  keywordEl.value = "";
  minSalaryEl.value = "";
  maxSalaryEl.value = "";
  clearStatus();
  hidePerf();
  resultsEl.innerHTML = `<div class="empty">Enter a keyword and/or salary range, then press Search.</div>`;
  countEl.textContent = "0 jobs";
}

document.getElementById("btnSearch").addEventListener("click", handleSearch);
document.getElementById("btnClear").addEventListener("click", handleClear);

keywordEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

minSalaryEl.addEventListener("input", handleSearch);
maxSalaryEl.addEventListener("input", handleSearch);

handleClear();


function sameSortedIds(a, b) {
  const x = [...a].sort((p, q) => p - q);
  const y = [...b].sort((p, q) => p - q);
  return x.length === y.length && x.every((id, i) => id === y[i]);
}

function assertSearchJobsReturnShape(out, label) {
  if (out === null || typeof out !== "object") {
    console.log(`${label} → FAIL (not an object)`);
    return false;
  }
  if (!("error" in out) || !("results" in out)) {
    console.log(`${label} → FAIL (missing error or results)`);
    return false;
  }
  if (!Array.isArray(out.results)) {
    console.log(`${label} → FAIL (results is not an array)`);
    return false;
  }
  return true;
}

function allResultsMatchSalary(results, rawMin, rawMax) {
  const min = toSalary(rawMin ?? "");
  const max = toSalary(rawMax ?? "");
  if (min === null && max === null) return true;
  return results.every(job => isSalaryMatch(job, min, max));
}

/** Expected job IDs for salary-only filter (no keyword), for cross-check. */
function expectedIdsSalaryOnly(minRaw, maxRaw) {
  const min = toSalary(minRaw);
  const max = toSalary(maxRaw);
  return JOBS.filter(job => isSalaryMatch(job, min, max))
    .map(j => j.id)
    .sort((a, b) => a - b);
}

/**
 * Salary-only acceptance tests (no keyword / search matching verified here).
 * All cases use an empty keyword; salary range drives results or validation errors.
 */
function runTests() {
  console.log("%cSalary filter — tests only (no keyword search tests)", "font-weight:bold;font-size:14px");
  console.log(
    "Salary range, min>max, invalid numbers, no matches, no-salary exclusion, count, min=max.\n"
  );

  const cases = [
    {
      id: "AC1",
      name: "Only listings whose salary falls within the selected range",
      minSalary: "4000",
      maxSalary: "4500",
      expectedIds: [1, 5],
      salaryFilterActive: true
    },
    {
      id: "AC2",
      name: "Valid salary range returns matching listings correctly",
      minSalary: "6000",
      maxSalary: "6500",
      expectedIds: [3],
      salaryFilterActive: true
    },
    {
      id: "AC3",
      name: "Min salary > max → error, no results",
      minSalary: "9000",
      maxSalary: "4000",
      expectedError: ERR_MIN_GT_MAX,
      expectNoSearch: true
    },
    {
      id: "AC4",
      name: "No listings in range → empty results",
      minSalary: "99000",
      maxSalary: "100000",
      expectedIds: [],
      salaryFilterActive: true
    },
    {
      id: "AC5",
      name: "Listings without salary excluded when salary filter applied",
      minSalary: "3000",
      maxSalary: "20000",
      expectedIds: [1, 2, 3, 4, 5, 6, 7, 9],
      salaryFilterActive: true,
      mustExcludeNoSalary: true
    },
    {
      id: "AC6",
      name: "Result count equals number of in-range jobs (logic)",
      minSalary: "4000",
      maxSalary: "4200",
      expectedIds: [5],
      salaryFilterActive: true,
      expectedCount: 1
    },
    {
      id: "AC7",
      name: "Min and max the same → jobs exactly within that band",
      minSalary: "5000",
      maxSalary: "5000",
      expectedIds: [9],
      salaryFilterActive: true
    },
    {
      id: "AC8a",
      name: "Invalid min (non-numeric) → rejected",
      minSalary: "not-a-number",
      maxSalary: "5000",
      expectedError: ERR_INVALID_SALARY,
      expectNoSearch: true
    },
    {
      id: "AC8b",
      name: "Invalid max (non-numeric) → rejected",
      minSalary: "4000",
      maxSalary: "12e34x",
      expectedError: ERR_INVALID_SALARY,
      expectNoSearch: true
    }
  ];

  let passed = 0;
  let total = cases.length;

  cases.forEach(c => {
    const minS = c.minSalary ?? "";
    const maxS = c.maxSalary ?? "";
    const t0 = performance.now();
    const out = searchJobs("", minS, maxS);
    const t1 = performance.now();

    if (!assertSearchJobsReturnShape(out, `${c.id} ${c.name}`)) {
      return;
    }

    const { error, results } = out;
    let ok = true;

    if (c.expectedError != null) {
      ok =
        error === c.expectedError &&
        results.length === 0 &&
        allResultsMatchSalary(results, minS, maxS);
      if (c.expectNoSearch && ok) {
        ok = results.length === 0 && error !== null;
      }
    } else {
      const ids = results.map(j => j.id);
      ok =
        error === null &&
        sameSortedIds(ids, c.expectedIds) &&
        allResultsMatchSalary(results, minS, maxS);

      if (ok && c.salaryFilterActive) {
        ok = sameSortedIds(ids, expectedIdsSalaryOnly(minS, maxS));
      }

      if (ok && c.mustExcludeNoSalary) {
        ok = !results.some(j => !hasSalaryInfo(j));
      }

      if (ok && typeof c.expectedCount === "number") {
        ok = results.length === c.expectedCount;
      }

      if (ok && c.salaryFilterActive) {
        ok = results.every(job => isSalaryMatch(job, toSalary(minS), toSalary(maxS)));
      }
    }

    console.log(`[${c.id}] ${c.name} → ${ok ? "PASS" : "FAIL"} (${(t1 - t0).toFixed(2)} ms)`);
    if (!ok) {
      console.log("  salary:", minS, maxS);
      console.log("  error:", error, "ids:", results.map(j => j.id));
      console.log("  expected:", c.expectedError ?? c.expectedIds);
    }
    if (ok) passed++;
  });

  // UI: no matches → status + empty state copy (handleSearch)
  if (keywordEl && minSalaryEl && maxSalaryEl && statusEl && countEl && resultsEl) {
    total += 3;
    keywordEl.value = "";
    minSalaryEl.value = "99000";
    maxSalaryEl.value = "100000";
    handleSearch();
    const u1 =
      statusEl.textContent === MSG_NO_MATCHES &&
      countEl.textContent === "0 jobs" &&
      /no results found/i.test(resultsEl.textContent || "");
    console.log(`[UI] No matches → status + “no results” copy → ${u1 ? "PASS" : "FAIL"}`);
    if (u1) passed++;

    keywordEl.value = "";
    minSalaryEl.value = "4000";
    maxSalaryEl.value = "4500";
    handleSearch();
    const n = 2;
    const u2 =
      statusEl.textContent.includes(String(n)) &&
      countEl.textContent === `${n} jobs` &&
      resultsEl.querySelectorAll(".job").length === n;
    console.log(`[UI] Count matches listed jobs (${n}) → ${u2 ? "PASS" : "FAIL"}`);
    if (u2) passed++;

    keywordEl.value = "";
    minSalaryEl.value = "9000";
    maxSalaryEl.value = "4000";
    handleSearch();
    const u3 =
      statusEl.textContent === ERR_MIN_GT_MAX &&
      countEl.textContent === "0 jobs" &&
      resultsEl.querySelectorAll(".job").length === 0;
    console.log(`[UI] Min > max → error shown, no cards, 0 count → ${u3 ? "PASS" : "FAIL"}`);
    if (u3) passed++;
  }

  const lenBefore = JOBS.length;
  searchJobs("", "4000", "5000");
  searchJobs("", "5000", "5000");
  const lenOk = JOBS.length === lenBefore;
  total += 1;
  console.log(`[SMOKE] JOBS array unchanged after searches → ${lenOk ? "PASS" : "FAIL"}`);
  if (lenOk) passed++;

  console.log(
    `\n${passed === total ? "All salary filter checks passed." : `Some checks failed (${total - passed}).`}`
  );
  console.log(`Result: ${passed}/${total} passed.`);
}

window.searchJobs = searchJobs;
window.runSalaryOnlyTests = runTests;
window.runSalaryFilterAcceptanceTests = runTests;
window.runSearchTests = runTests;
window.MSG_NEED_INPUT = MSG_NEED_INPUT;
window.MSG_NO_MATCHES = MSG_NO_MATCHES;
window.ERR_INVALID_SALARY = ERR_INVALID_SALARY;
window.ERR_MIN_GT_MAX = ERR_MIN_GT_MAX;
window.toSalary = toSalary;
window.isSalaryMatch = isSalaryMatch;

const isSearchTestPage =
  /searchtest\.html$/i.test(document.location.pathname || "") ||
  /searchtest\.html/i.test(String(document.location.href || ""));

if (isSearchTestPage) {
  window.addEventListener("load", runTests);
}
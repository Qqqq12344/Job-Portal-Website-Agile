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
  }
];

const keywordEl = document.getElementById("keyword");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("countText");
const perfEl = document.getElementById("perf");

const ACCEPTABLE_MS = 200;

/** Shown when keyword is empty or whitespace-only (user story: prompt for valid search term). */
const MSG_EMPTY_KEYWORD =
  "Please enter a valid search term (job title, skill, or company name).";

/** Shown when keyword matches no jobs (user story: no results message). */
const MSG_NO_KEYWORD_MATCHES = "No results were found for that keyword. Try another search term.";

const normalize = (s) => String(s ?? "").trim().toLowerCase();

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

function searchJobs(rawKeyword) {
  const kw = normalize(rawKeyword);

  if (!kw) {
    return { error: MSG_EMPTY_KEYWORD, results: [] };
  }

  const matched = JOBS.filter(job => keywordMatchesJob(job, kw));
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

  const t0 = performance.now();
  const { error, results } = searchJobs(input);
  const t1 = performance.now();

  if (error) {
    setStatus("error", error);
    resultsEl.innerHTML =
      `<div class="empty">Enter a job title, skill, or company name to search.</div>`;
    countEl.textContent = "0 jobs";
    showPerf(t1 - t0, 0);
    return;
  }

  if (results.length === 0) {
    setStatus("error", MSG_NO_KEYWORD_MATCHES);
    countEl.textContent = "0 jobs";
    resultsEl.innerHTML = `<div class="empty">No results were found. Try a different keyword.</div>`;
    showPerf(t1 - t0, 0);
    return;
  }

  setStatus(
    "ok",
    `Showing ${results.length} relevant job listing(s) for your search.`
  );
  countEl.textContent = `${results.length} job${results.length === 1 ? "" : "s"}`;
  renderResults(results, input);
  showPerf(t1 - t0, results.length);
}

function handleClear() {
  keywordEl.value = "";
  clearStatus();
  hidePerf();
  resultsEl.innerHTML = `<div class="empty">Enter a keyword (title, skill, or company) and press Search.</div>`;
  countEl.textContent = "0 jobs";
}

document.getElementById("btnSearch").addEventListener("click", handleSearch);
document.getElementById("btnClear").addEventListener("click", handleClear);

keywordEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

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

function allResultsMatchKeyword(results, rawKeyword) {
  const kw = normalize(rawKeyword);
  if (!kw) return results.length === 0;
  return results.every(job => keywordMatchesJob(job, kw));
}

function expectedIdsForKeyword(rawKeyword) {
  const kw = normalize(rawKeyword);
  if (!kw) return null;
  return JOBS.filter(job => keywordMatchesJob(job, kw))
    .map(j => j.id)
    .sort((a, b) => a - b);
}

function runTests() {
  console.log("%csearchJobs logic tests", "font-weight:bold;font-size:14px");
  console.log("Checking: return shape, empty input, ID sets vs spec, each hit matches rule, full-catalog consistency.\n");

  const cases = [
    {
      name: "Full title match",
      keyword: "Junior Business Analyst",
      expectedIds: [1]
    },
    {
      name: "Partial title match",
      keyword: "Java",
      expectedIds: [3]
    },
    {
      name: "Skill / partial skill strings (SQL, MySQL, PostgreSQL)",
      keyword: "SQL",
      expectedIds: [1, 3, 5, 6]
    },
    {
      name: "Company match (case-insensitive)",
      keyword: "fintechx",
      expectedIds: [1]
    },
    {
      name: "Partial company name",
      keyword: "silver",
      expectedIds: [4]
    },
    {
      name: "Partial skill (REST)",
      keyword: "rest",
      expectedIds: [3]
    },
    {
      name: "Case-insensitive title",
      keyword: "JAVA",
      expectedIds: [3]
    },
    {
      name: "Partial title shared by multiple jobs",
      keyword: "business",
      expectedIds: [1, 2]
    },
    {
      name: "Empty keyword → error, no results",
      keyword: "",
      expectedError: MSG_EMPTY_KEYWORD
    },
    {
      name: "Whitespace-only keyword → error, no results",
      keyword: "   \t  ",
      expectedError: MSG_EMPTY_KEYWORD
    },
    {
      name: "No matches → no error, empty array",
      keyword: "Astronaut",
      expectedIds: []
    }
  ];

  let passed = 0;
  const total = cases.length + 2;

  cases.forEach(c => {
    const t0 = performance.now();
    const out = searchJobs(c.keyword);
    const t1 = performance.now();

    if (!assertSearchJobsReturnShape(out, c.name)) {
      return;
    }

    const { error, results } = out;
    let ok = true;

    if (c.expectedError != null) {
      ok =
        error === c.expectedError &&
        results.length === 0 &&
        allResultsMatchKeyword(results, c.keyword);
    } else {
      const ids = results.map(j => j.id);
      ok =
        error === null &&
        sameSortedIds(ids, c.expectedIds) &&
        allResultsMatchKeyword(results, c.keyword);

      if (ok) {
        const catalogIds = expectedIdsForKeyword(c.keyword);
        ok = sameSortedIds(ids, catalogIds);
      }
    }

    console.log(`${c.name} → ${ok ? "PASS" : "FAIL"} (${(t1 - t0).toFixed(2)} ms)`);
    if (!ok) {
      console.log("  keyword:", JSON.stringify(c.keyword));
      console.log("  error:", error, "ids:", results.map(j => j.id));
      console.log("  expected:", c.expectedError ?? c.expectedIds);
    }
    if (ok) passed++;
  });

}

window.keywordMatchesJob = keywordMatchesJob;
window.searchJobs = searchJobs;
window.runSearchTests = runTests;
window.MSG_EMPTY_KEYWORD = MSG_EMPTY_KEYWORD;
window.MSG_NO_KEYWORD_MATCHES = MSG_NO_KEYWORD_MATCHES;

const isSearchTestPage =
  /searchtest\.html$/i.test(document.location.pathname || "") ||
  /searchtest\.html/i.test(String(document.location.href || ""));

if (isSearchTestPage) {
  window.addEventListener("load", runTests);
}
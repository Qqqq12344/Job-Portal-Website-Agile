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
 * Keyword search: case-insensitive partial match on title, company, or skills.
 * Returns { error, results }; empty keyword yields error (no results).
 */
function searchJobs(rawKeyword) {
  const kw = normalize(rawKeyword);

  if (!kw) {
    return { error: MSG_EMPTY_KEYWORD, results: [] };
  }

  const matched = JOBS.filter(job => {
    const title = normalize(job.title);
    const company = normalize(job.company);
    const skills = job.skills.map(normalize);

    return (
      title.includes(kw) ||
      company.includes(kw) ||
      skills.some(s => s.includes(kw))
    );
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

// ✅ UPDATED renderResults with View Details
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

    // ✅ button click
    card.querySelector(".btn-view").addEventListener("click", (e) => {
      e.stopPropagation();
      goToJobDetails(job.id);
    });

    // ✅ whole card clickable
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



// Automated checks: keyword search only (`searchJobs`). No salary filtering tested here.

function runTests() {
  const tests = [
    {
      name: "Valid keyword — full job title returns relevant listing(s)",
      keyword: "Junior Business Analyst",
      expectedIds: [1]
    },
    {
      name: "Keyword — job title (partial match)",
      keyword: "Java",
      expectedIds: [3]
    },
    {
      name: "Keyword — skill (SQL / MySQL / PostgreSQL partial match)",
      keyword: "SQL",
      expectedIds: [1, 3, 5, 6]
    },
    {
      name: "Keyword — company name (case-insensitive)",
      keyword: "fintechx",
      expectedIds: [1]
    },
    {
      name: "Keyword — partial company name",
      keyword: "silver",
      expectedIds: [4]
    },
    {
      name: "Keyword — partial skill (REST)",
      keyword: "rest",
      expectedIds: [3]
    },
    {
      name: "Case-insensitive — uppercase keyword matches lowercase title text",
      keyword: "JAVA",
      expectedIds: [3]
    },
    {
      name: "Partial match — shared substring in multiple titles",
      keyword: "business",
      expectedIds: [1, 2]
    },
    {
      name: "Empty keyword prompts valid search term",
      keyword: "",
      expectedError: MSG_EMPTY_KEYWORD
    },
    {
      name: "Whitespace-only keyword treated as empty",
      keyword: "   \t  ",
      expectedError: MSG_EMPTY_KEYWORD
    },
    {
      name: "No matching keyword returns empty results (no error from searchJobs)",
      keyword: "Astronaut",
      expectedIds: []
    }
  ];

  let passed = 0;

  tests.forEach(test => {
    const t0 = performance.now();
    const { error, results } = searchJobs(test.keyword);
    const t1 = performance.now();
    const duration = (t1 - t0).toFixed(2);

    let success = false;
    if (test.expectedError) {
      success = error === test.expectedError;
    } else {
      const resultIds = results.map(j => j.id).sort();
      success = JSON.stringify(resultIds) === JSON.stringify(test.expectedIds.sort());
    }

    console.log(`${test.name} → ${success ? "PASS" : "FAIL"} (${duration} ms)`);
    if (!success) {
      console.log("  Expected:", test.expectedError ?? test.expectedIds, "Got:", error ?? results.map(j => j.id));
    }

    if (success) passed++;
  });

  console.log(`\nKeyword search tests: ${passed}/${tests.length} passed.`);
}

// Expose for manual console checks; auto-run on this test page only
window.searchJobs = searchJobs;
window.MSG_EMPTY_KEYWORD = MSG_EMPTY_KEYWORD;
window.MSG_NO_KEYWORD_MATCHES = MSG_NO_KEYWORD_MATCHES;

const isSearchTestPage =
  /searchtest\.html$/i.test(document.location.pathname || "") ||
  /searchtest\.html/i.test(String(document.location.href || ""));

if (isSearchTestPage) {
  window.addEventListener("load", runTests);
}
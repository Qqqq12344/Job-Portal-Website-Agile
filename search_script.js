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
    description: "Assist in gathering user requirements, preparing documentation, supporting UAT, and working with stakeholders to improve business processes.",
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
    description: "Analyze court-related system requirements, prepare BRD, coordinate with stakeholders, and support testing and implementation activities.",
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
    description: "Develop and maintain backend applications using Java and Spring framework. Build APIs, manage databases, and support bug fixing.",
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
    description: "Design user interfaces and experiences for web and mobile applications. Prepare wireframes, mockups, and interactive prototypes.",
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
    description: "Interpret data, generate reports, build dashboards, and support management decisions through data-driven insights.",
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
    description: "Develop server-side applications and RESTful APIs using Node.js. Optimize database performance and maintain secure backend services.",
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
    description: "Create test plans, run manual and automated tests, log defects, and ensure software quality before release.",
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
    description: "Support product discovery, competitor analysis, and documentation for internal product improvements.",
    deadline: "2026-03-30",
    isAvailable: true
  }
];

const keywordEl = document.getElementById("keyword");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("countText");
const perfEl = document.getElementById("perf");
const minSalaryEl = document.getElementById("minSalary");
const maxSalaryEl = document.getElementById("maxSalary");

const ACCEPTABLE_MS = 200;

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
  perfEl.textContent = `Response time: ${ms.toFixed(2)} ms • Results: ${count} • ${ms <= ACCEPTABLE_MS ? "Acceptable" : "Slow"}`;
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

function searchJobs(rawKeyword, rawMinSalary, rawMaxSalary) {
  const kw = normalize(rawKeyword);
  const minSalary = toSalary(rawMinSalary);
  const maxSalary = toSalary(rawMaxSalary);

  if (Number.isNaN(minSalary) || Number.isNaN(maxSalary)) {
    return { error: "Please enter a valid salary range using numbers only.", results: [] };
  }

  if (minSalary !== null && maxSalary !== null && minSalary > maxSalary) {
    return { error: "Minimum salary cannot be higher than maximum salary. Please enter a valid salary range.", results: [] };
  }

  if (!kw && minSalary === null && maxSalary === null) {
    return { error: "Please enter a keyword or a salary range to search.", results: [] };
  }

  const matched = JOBS.filter(job => {
    const title = normalize(job.title);
    const company = normalize(job.company);
    const skills = job.skills.map(normalize);
    const keywordMatch = !kw || title.includes(kw) || company.includes(kw) || skills.some(s => s.includes(kw));
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
        <div class="avatar" title="${escapeHtml(job.company)}">${initials(job.company)}</div>
        <div style="min-width:0">
          <h4>${highlight(job.title, rawKeyword.trim())}</h4>
          <div class="meta">
            <span>${highlight(job.company, rawKeyword.trim())}</span> •
            <span>${escapeHtml(job.location)}</span> •
            <span class="tag">${formatSalary(job)}</span>
          </div>
          <div class="tags">${skillsHtml}</div>
        </div>
      </div>

      <div class="right">
        <div class="mini">🕒 ${escapeHtml(job.posted)}</div>
        <button class="apply primary view-btn" type="button">View Details</button>
      </div>
    `;

    card.addEventListener("click", () => goToJobDetails(job.id));

    const viewBtn = card.querySelector(".view-btn");
    viewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
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
    resultsEl.innerHTML = `<div class="empty">Type a keyword above to start searching (e.g. <b>java</b>, <b>analyst</b>, <b>Silverlake</b>).</div>`;
    countEl.textContent = "0 jobs";
    showPerf(t1 - t0, 0);
    return;
  }

  if (results.length === 0) {
    setStatus("error", "No job listings found for the selected keyword/salary range.");
    resultsEl.innerHTML = `<div class="empty">No results found. Try adjusting your keyword or salary range.</div>`;
    countEl.textContent = "0 jobs";
    showPerf(t1 - t0, 0);
    return;
  }

  setStatus("ok", `Showing ${results.length} job(s) that match your filters.`);
  countEl.textContent = `${results.length} job${results.length > 1 ? "s" : ""}`;
  renderResults(results, input);
  showPerf(t1 - t0, results.length);
}

function handleClear() {
  keywordEl.value = "";
  minSalaryEl.value = "";
  maxSalaryEl.value = "";
  clearStatus();
  hidePerf();
  resultsEl.innerHTML = `<div class="empty">Type a keyword to start searching jobs.</div>`;
  countEl.textContent = "0 jobs";
  keywordEl.focus();
}

document.getElementById("btnSearch").addEventListener("click", handleSearch);
document.getElementById("btnClear").addEventListener("click", handleClear);
keywordEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});
minSalaryEl.addEventListener("input", handleSearch);
maxSalaryEl.addEventListener("input", handleSearch);

window.JOBS = JOBS;

handleClear();
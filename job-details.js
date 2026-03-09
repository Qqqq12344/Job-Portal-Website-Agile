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
  }
];

const ACCEPTABLE_MS = 200;
const perfEl = document.getElementById("detailsPerf");
const container = document.getElementById("jobDetailsContainer");

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatSalary(job) {
  if (job.salaryMin && job.salaryMax) {
    return `RM ${job.salaryMin.toLocaleString()} - RM ${job.salaryMax.toLocaleString()} / month`;
  }
  return "Salary not specified";
}

function formatDate(dateString) {
  if (!dateString) return "Not specified";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function getJobIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
}

function showPerf(ms) {
  perfEl.style.display = "block";
  perfEl.textContent = `Page load time: ${ms.toFixed(2)} ms • ${ms <= ACCEPTABLE_MS ? "Acceptable" : "Slow"}`;
}

function renderNotFound() {
  container.innerHTML = `
    <div class="detail-card">
      <h2>Job not found</h2>
      <p class="detail-text">The selected job posting does not exist.</p>
    </div>
  `;
}

function renderExpired(job) {
  container.innerHTML = `
    <div class="detail-card">
      <div class="badge danger">No Longer Available</div>
      <h2>${escapeHtml(job.title)}</h2>
      <p class="company-line">${escapeHtml(job.company)} • ${escapeHtml(job.location)}</p>

      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Salary Range</span>
          <span class="detail-value">${escapeHtml(formatSalary(job))}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Application Deadline</span>
          <span class="detail-value">${escapeHtml(formatDate(job.deadline))}</span>
        </div>
      </div>

      <div class="section">
        <h3>Job Description</h3>
        <p class="detail-text">${escapeHtml(job.description)}</p>
      </div>

      <div class="section">
        <h3>Status</h3>
        <p class="expired-message">This job posting is no longer available or has expired.</p>
      </div>

      <button class="apply disabled-btn" disabled>Apply Unavailable</button>
    </div>
  `;
}

function renderJobDetails(job) {
  const skillsHtml = job.skills.map(skill => `<span class="tag">${escapeHtml(skill)}</span>`).join("");

  container.innerHTML = `
    <div class="detail-card">
      <div class="badge success">Available</div>
      <h2>${escapeHtml(job.title)}</h2>
      <p class="company-line">${escapeHtml(job.company)} • ${escapeHtml(job.location)}</p>

      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Salary Range</span>
          <span class="detail-value">${escapeHtml(formatSalary(job))}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Application Deadline</span>
          <span class="detail-value">${escapeHtml(formatDate(job.deadline))}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Posted</span>
          <span class="detail-value">${escapeHtml(job.posted)}</span>
        </div>
      </div>

      <div class="section">
        <h3>Job Description</h3>
        <p class="detail-text">${escapeHtml(job.description)}</p>
      </div>

      <div class="section">
        <h3>Required Skills</h3>
        <div class="tags">${skillsHtml}</div>
      </div>

      <button class="apply primary" onclick="applyJob('${escapeHtml(job.title)}')">Apply</button>
    </div>
  `;
}

function applyJob(title) {
  alert(`Apply clicked for: ${title}`);
}

function initDetailsPage() {
  const t0 = performance.now();

  const jobId = getJobIdFromUrl();
  const job = JOBS.find(j => j.id === jobId);

  const t1 = performance.now();
  showPerf(t1 - t0);

  if (!job) {
    renderNotFound();
    return;
  }

  if (!job.isAvailable) {
    renderExpired(job);
    return;
  }

  renderJobDetails(job);
}

initDetailsPage();
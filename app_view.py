from datetime import datetime

from flask import Flask, render_template_string, request, url_for


app = Flask(__name__)


# ---------- Dummy data ----------

USERS = {
    1: "Job Seeker 1 (with applications)",
    2: "Job Seeker 2 (no applications)",
}

APPLICATIONS = [
    {
        "id": 1,
        "user_id": 1,
        "job_title": "Software Engineer",
        "company_name": "Tech Corp",
        "applied_on": datetime(2026, 2, 10),
        "status": "Under Review",
    },
    {
        "id": 2,
        "user_id": 1,
        "job_title": "Frontend Developer",
        "company_name": "Creative Studio",
        "applied_on": datetime(2026, 2, 18),
        "status": "Interview Scheduled",
    },
    {
        "id": 3,
        "user_id": 1,
        "job_title": "Data Analyst",
        "company_name": "Insight Analytics",
        "applied_on": datetime(2026, 1, 28),
        "status": "Rejected",
    },
]

STATUSES = sorted({app["status"] for app in APPLICATIONS})

def get_current_user_id() -> int:
    """
    Simulate which job seeker is currently "logged in" using a query parameter.
    ?user=1 -> Job Seeker 1
    ?user=2 -> Job Seeker 2 (has no applications)
    """
    user_param = request.args.get("user", "1")
    try:
        user_id = int(user_param)
    except ValueError:
        user_id = 1

    if user_id not in USERS:
        user_id = 1
    return user_id


# ---------- Design ----------

PAGE_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>My Job Applications</title>
    <style>
        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: radial-gradient(circle at top left, #ecf4ff 0, #f8fbff 40%, #f5f7fb 100%);
            color: #111827;
        }

        .page {
            min-height: 100vh;
            max-width: 960px;
            margin: 0 auto;
            padding: 32px 16px 40px;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
        }

        .subtitle {
            margin: 4px 0 0;
            color: #6b7280;
            font-size: 14px;
        }

        .header-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
        }

        .user-switcher {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
        }

        .user-switcher-label {
            color: #6b7280;
        }

        .user-pill {
            padding: 4px 10px;
            border-radius: 999px;
            border: 1px solid #d1d5db;
            background: #f9fafb;
            color: #374151;
            font-size: 12px;
            text-decoration: none;
            transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }

        .user-pill:hover {
            background: #eff6ff;
            border-color: #93c5fd;
        }

        .user-pill.active {
            background: #1d4ed8;
            border-color: #1d4ed8;
            color: #ffffff;
        }

        .badge {
            padding: 6px 12px;
            border-radius: 999px;
            background: rgba(59, 130, 246, 0.1);
            color: #1d4ed8;
            font-size: 12px;
            font-weight: 600;
        }

        .card {
            background: #ffffff;
            border-radius: 16px;
            padding: 20px 20px 16px;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
            border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .controls {
            display: flex;
            flex-wrap: wrap;
            gap: 12px 24px;
            margin-bottom: 16px;
        }

        .control-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
            min-width: 160px;
        }

        .control-group label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #6b7280;
        }

        select {
            padding: 6px 10px;
            border-radius: 999px;
            border: 1px solid #d1d5db;
            background: #f9fafb;
            font-size: 13px;
            outline: none;
            transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }

        select:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
            background: #ffffff;
        }

        .table-wrapper {
            width: 100%;
            overflow-x: auto;
        }

        .applications-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }

        .applications-table thead {
            background: #f9fafb;
        }

        .applications-table th,
        .applications-table td {
            padding: 10px 12px;
            text-align: left;
        }

        .applications-table th {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            border-bottom: 1px solid #e5e7eb;
        }

        .applications-table tbody tr:nth-child(even) {
            background: #f9fafb;
        }

        .applications-table tbody tr:hover {
            background: #eff6ff;
        }

        .job-title {
            font-weight: 600;
        }

        .status-chip {
            display: inline-flex;
            align-items: center;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
        }

        .status-under-review {
            background: rgba(59, 130, 246, 0.12);
            color: #1d4ed8;
        }

        .status-interview-scheduled {
            background: rgba(16, 185, 129, 0.12);
            color: #047857;
        }

        .status-rejected {
            background: rgba(248, 113, 113, 0.12);
            color: #b91c1c;
        }

        .empty-state {
            padding: 32px 16px;
            text-align: center;
        }

        .empty-state h2 {
            margin: 0 0 4px;
            font-size: 18px;
        }

        .empty-state p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
        }

        .footer {
            margin-top: auto;
            padding-top: 8px;
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
        }

        @media (max-width: 640px) {
            .header {
                flex-direction: column;
                align-items: flex-start;
            }

            .card {
                padding: 16px 12px 12px;
            }
        }
    </style>
</head>
<body>
<div class="page">
    <header class="header">
        <div>
            <h1>My Job Applications</h1>
            <p class="subtitle">Track all the jobs you have applied for in one place.</p>
        </div>
        <div class="header-right">
            <div class="user-switcher">
                <span class="user-switcher-label">Viewing as:</span>
                <a href="{{ url_for('view_applications', user=1) }}"
                   class="user-pill {% if current_user_id == 1 %}active{% endif %}">
                    Job Seeker 1
                </a>
                <a href="{{ url_for('view_applications', user=2) }}"
                   class="user-pill {% if current_user_id == 2 %}active{% endif %}">
                    Job Seeker 2
                </a>
            </div>
            <div class="badge">Job Seeker Dashboard</div>
        </div>
    </header>

    <section class="card">
        <form method="get" class="controls">
            <input type="hidden" name="user" value="{{ current_user_id }}">
            <div class="control-group">
                <label for="status">Status</label>
                <select name="status" id="status" onchange="this.form.submit()">
                    <option value="">All statuses</option>
                    {% for s in statuses %}
                        <option value="{{ s }}" {% if current_status == s %}selected{% endif %}>
                            {{ s }}
                        </option>
                    {% endfor %}
                </select>
            </div>

            <div class="control-group">
                <label for="sort">Sort by application date</label>
                <select name="sort" id="sort" onchange="this.form.submit()">
                    <option value="desc" {% if sort_order == "desc" %}selected{% endif %}>Newest first</option>
                    <option value="asc" {% if sort_order == "asc" %}selected{% endif %}>Oldest first</option>
                </select>
            </div>
        </form>

        {% if not has_any_applications %}
            <div class="empty-state">
                <h2>No applications yet</h2>
                <p>You have not applied for any jobs. Start exploring opportunities and apply to your first job!</p>
            </div>
        {% else %}
            {% if applications %}
                <div class="table-wrapper">
                    <table class="applications-table">
                        <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Company</th>
                            <th>Application Date</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {% for app in applications %}
                            <tr>
                                <td class="job-title">{{ app.job_title }}</td>
                                <td>{{ app.company_name }}</td>
                                <td>{{ app.applied_on.strftime("%Y-%m-%d") }}</td>
                                <td>
                                    <span class="status-chip status-{{ app.status|lower|replace(' ', '-') }}">
                                        {{ app.status }}
                                    </span>
                                </td>
                            </tr>
                        {% endfor %}
                        </tbody>
                    </table>
                </div>
            {% else %}
                <div class="empty-state">
                    <h2>No applications match your filters</h2>
                    <p>Try clearing the filters to see more applications.</p>
                </div>
            {% endif %}
        {% endif %}
    </section>

    <footer class="footer">
        <span>&copy; 2026 Job Seeker Application Management Module</span>
    </footer>
</div>
</body>
</html>
"""

@app.route("/")
@app.route("/applications")
def view_applications():
    current_user_id = get_current_user_id()
    user_apps = [app for app in APPLICATIONS if app["user_id"] == current_user_id]

    status_filter = request.args.get("status", "").strip()
    sort_order = request.args.get("sort", "desc")  # "asc" or "desc"

    filtered_apps = user_apps
    if status_filter:
        filtered_apps = [app for app in filtered_apps if app["status"] == status_filter]

    reverse = sort_order != "asc"  # default: newest first
    filtered_apps = sorted(filtered_apps, key=lambda a: a["applied_on"], reverse=reverse)

    return render_template_string(
        PAGE_TEMPLATE,
        applications=filtered_apps,
        has_any_applications=len(user_apps) > 0,
        current_user_id=current_user_id,
        users=USERS,
        statuses=STATUSES,
        current_status=status_filter,
        sort_order=sort_order,
    )


if __name__ == "__main__":
    app.run(debug=True)


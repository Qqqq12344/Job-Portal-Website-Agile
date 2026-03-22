from __future__ import annotations

from datetime import datetime

from flask import Flask, abort, render_template_string, request, session, url_for

app = Flask(__name__)
app.secret_key = "dev-demo-key"


# ---------- Dummy data ----------

USERS = {
    1: "Job Seeker 1 (with applications)",
    2: "Job Seeker 2 (no applications)",
}

# status: same vocabulary as the example table
APPLICATIONS: list[dict] = [
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
        "rejected_at": datetime(2026, 2, 5, 14, 30),
        "rejection_feedback": "We selected a candidate with more analytics tooling experience.",
        "rejection_feedback_at": datetime(2026, 2, 5, 15, 0),
    },
    {
        "id": 4,
        "user_id": 1,
        "job_title": "Backend Engineer",
        "company_name": "Cloud Nine",
        "applied_on": datetime(2026, 1, 10),
        "status": "Rejected",
        "rejected_at": datetime(2026, 1, 20, 9, 0),
        "rejection_feedback": (
            "Thank you for your interest. After review, we are moving forward with candidates "
            "whose backend experience aligns more closely with our current stack."
        ),
        "rejection_feedback_at": datetime(2026, 1, 20, 10, 15),
    },
    # Demo: always treated as already read (no "New" / no green bar)
    {
        "id": 5,
        "user_id": 1,
        "job_title": "QA Engineer",
        "company_name": "Quality Labs",
        "applied_on": datetime(2025, 12, 1),
        "status": "Rejected",
        "rejected_at": datetime(2025, 12, 15, 10, 0),
        "rejection_feedback": "We appreciated your interview. We hired someone with more automation experience.",
        "rejection_feedback_at": datetime(2025, 12, 15, 11, 30),
        "rejection_feedback_read": True,
    },
    {
        "id": 6,
        "user_id": 1,
        "job_title": "Support Specialist",
        "company_name": "HelpDesk Inc",
        "applied_on": datetime(2025, 11, 5),
        "status": "Rejected",
        "rejected_at": datetime(2025, 11, 20, 16, 0),
        "rejection_feedback": "Thank you for applying. We have filled this role internally.",
        "rejection_feedback_at": datetime(2025, 11, 21, 9, 0),
        "rejection_feedback_read": True,
    },
]

NOTIFICATIONS: list[dict] = [
    {
        "id": 1,
        "user_id": 1,
        "application_id": 3,
        "message": 'Your application for "Data Analyst" at Insight Analytics was rejected.',
        "created_at": datetime(2026, 2, 5, 14, 31),
    },
    {
        "id": 2,
        "user_id": 1,
        "application_id": 4,
        "message": 'Your application for "Backend Engineer" at Cloud Nine was rejected.',
        "created_at": datetime(2026, 1, 20, 9, 1),
    },
]


@app.before_request
def _reset_demo_on_browser_reload() -> None:
    if request.method != "GET":
        return
    if request.headers.get("Sec-Fetch-Dest") != "document":
        return
    cc = (request.headers.get("Cache-Control") or "").lower()
    pragma = (request.headers.get("Pragma") or "").lower()
    if "max-age=0" in cc or pragma == "no-cache":
        session.clear()


@app.route("/__demo_reset", methods=["POST"])
def demo_reset_session():
    session.clear()
    return ("", 204)


def get_current_user_id() -> int:
    user_param = request.args.get("user", "1")
    try:
        user_id = int(user_param)
    except ValueError:
        user_id = 1

    if user_id not in USERS:
        user_id = 1
    return user_id


def _application_by_id(app_id: int) -> dict | None:
    for row in APPLICATIONS:
        if row["id"] == app_id:
            return row
    return None


def _is_rejected(row: dict) -> bool:
    return row.get("status") == "Rejected"


def _seen_app_ids(uid: int) -> set[int]:
    raw = session.get("seen_app_ids", {})
    if not isinstance(raw, dict):
        return set()
    return set(raw.get(str(uid), []))


def _mark_app_seen(uid: int, app_id: int) -> None:
    key_u = str(uid)
    data = session.get("seen_app_ids")
    if not isinstance(data, dict):
        data = {}
    else:
        data = {str(k): list(v) for k, v in data.items()}
    s = set(data.get(key_u, []))
    s.add(app_id)
    data[key_u] = list(s)
    session["seen_app_ids"] = data
    session.modified = True


def _read_notif_ids(uid: int) -> set[int]:
    raw = session.get("read_notif_ids", {})
    if not isinstance(raw, dict):
        return set()
    return set(raw.get(str(uid), []))


def _mark_notif_read(uid: int, notif_id: int) -> None:
    key_u = str(uid)
    data = session.get("read_notif_ids")
    if not isinstance(data, dict):
        data = {}
    else:
        data = {str(k): list(v) for k, v in data.items()}
    s = set(data.get(key_u, []))
    s.add(notif_id)
    data[key_u] = list(s)
    session["read_notif_ids"] = data
    session.modified = True


def _notif_is_read(n: dict, uid: int) -> bool:
    return n["id"] in _read_notif_ids(uid)


def _mark_notifs_for_app(uid: int, application_id: int) -> None:
    for n in NOTIFICATIONS:
        if n["user_id"] == uid and n["application_id"] == application_id:
            _mark_notif_read(uid, n["id"])


def _unread_rejection(row: dict, uid: int) -> bool:
    if not _is_rejected(row):
        return False
    if row.get("rejection_feedback_read") is True:
        return False
    return row["id"] not in _seen_app_ids(uid)


def _unread_notifications(user_id: int) -> int:
    return sum(
        1
        for n in NOTIFICATIONS
        if n["user_id"] == user_id and not _notif_is_read(n, user_id)
    )


# ---------- Templates (inline, same style as example) ----------

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
            flex-wrap: wrap;
            justify-content: flex-end;
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

        .badge-warn {
            background: rgba(234, 179, 8, 0.15);
            color: #a16207;
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

        .row-unread {
            box-shadow: inset 3px 0 0 #22c55e;
            background: #f0fdf4 !important;
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

        .tag-new {
            margin-left: 6px;
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fcd34d;
        }

        .link-detail {
            font-size: 13px;
            font-weight: 600;
            color: #1d4ed8;
            text-decoration: none;
        }

        .link-detail:hover {
            text-decoration: underline;
        }

        .muted {
            color: #6b7280;
            font-size: 13px;
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

        .notif-icon-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 40px;
            height: 40px;
            border-radius: 999px;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(148, 163, 184, 0.35);
            text-decoration: none;
            color: #1d4ed8;
            transition: background 0.15s ease, border-color 0.15s ease;
        }

        .notif-icon-link:hover {
            background: #eff6ff;
            border-color: #93c5fd;
        }

        .notif-icon-link.has-unread {
            background: rgba(234, 179, 8, 0.15);
            border-color: rgba(202, 138, 4, 0.45);
        }

        .notif-icon-link svg {
            width: 22px;
            height: 22px;
        }

        .notif-count {
            position: absolute;
            top: 0;
            right: 0;
            min-width: 18px;
            height: 18px;
            padding: 0 5px;
            border-radius: 999px;
            background: #dc2626;
            color: #fff;
            font-size: 10px;
            font-weight: 700;
            line-height: 18px;
            text-align: center;
            border: 2px solid #f8fbff;
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
            <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; justify-content:flex-end;">
                <a href="{{ url_for('view_notifications', user=current_user_id) }}"
                   class="notif-icon-link {% if unread_notifications %}has-unread{% endif %}"
                   aria-label="Notifications{% if unread_notifications %}, {{ unread_notifications }} unread{% endif %}"
                   title="Notifications{% if unread_notifications %} ({{ unread_notifications }} unread){% endif %}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {% if unread_notifications %}
                        <span class="notif-count">{{ unread_notifications }}</span>
                    {% endif %}
                </a>
                <span class="badge">Job Seeker Dashboard</span>
            </div>
        </div>
    </header>

    <section class="card">
        <form method="get" class="controls">
            <input type="hidden" name="user" value="{{ current_user_id }}">
            <div class="control-group">
                <label for="sort">Sort by application date</label>
                <select name="sort" id="sort" onchange="this.form.submit()">
                    <option value="desc" {% if sort_order == "desc" %}selected{% endif %}>Newest first</option>
                    <option value="asc" {% if sort_order == "asc" %}selected{% endif %}>Oldest first</option>
                </select>
            </div>
        </form>

        {% if not has_any_rejected %}
            <div class="empty-state">
                <h2>No rejection feedback</h2>
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
                            <th>Rejection</th>
                        </tr>
                        </thead>
                        <tbody>
                        {% for row in applications %}
                            <tr class="{% if row['unread'] %}row-unread{% endif %}">
                                <td class="job-title">{{ row.job_title }}</td>
                                <td>{{ row.company_name }}</td>
                                <td>{{ row.applied_on.strftime("%Y-%m-%d") }}</td>
                                <td>
                                    <span class="status-chip status-{{ row.status|lower|replace(' ', '-') }}">
                                        {{ row.status }}
                                    </span>
                                    {% if row['unread'] %}
                                        <span class="tag-new">New</span>
                                    {% endif %}
                                </td>
                                <td>
                                    <a class="link-detail" href="{{ url_for('application_detail', app_id=row.id, user=current_user_id) }}">View feedback</a>
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
        <span>&copy; 2026 Rejection feedback</span>
    </footer>
</div>
</body>
</html>
"""

DETAIL_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Application #{{ app.id }} — Rejection</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: radial-gradient(circle at top left, #ecf4ff 0, #f8fbff 40%, #f5f7fb 100%);
            color: #111827;
        }
        .page {
            min-height: 100vh;
            max-width: 720px;
            margin: 0 auto;
            padding: 32px 16px 40px;
        }
        .back {
            margin-bottom: 16px;
        }
        .back a {
            color: #1d4ed8;
            font-weight: 600;
            text-decoration: none;
            font-size: 14px;
        }
        .card {
            background: #ffffff;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
            border: 1px solid rgba(148, 163, 184, 0.2);
        }
        h1 { margin: 0 0 8px; font-size: 22px; }
        .meta { color: #6b7280; font-size: 14px; margin: 0 0 16px; }
        .feedback {
            white-space: pre-wrap;
            line-height: 1.6;
            font-size: 15px;
        }
        .muted { color: #6b7280; font-size: 14px; }
        h2.feedback-heading { font-size: 16px; margin: 16px 0 8px; }
    </style>
</head>
<body>
<div class="page">
    <p class="back"><a href="{{ url_for('view_applications', user=current_user_id) }}">&larr; back</a></p>
    <div class="card">
        <h1>{{ app.job_title }}</h1>
        <p class="meta">{{ app.company_name }} · Applied {{ app.applied_on.strftime("%Y-%m-%d") }}</p>
        {% if app.rejected_at %}
            <p class="meta">Rejected on: {{ app.rejected_at.strftime("%Y-%m-%d %H:%M") }}</p>
        {% endif %}
        <h2 class="feedback-heading">Employer feedback</h2>
        <div class="feedback">{{ app.rejection_feedback or "—" }}</div>
        {% if app.rejection_feedback_at %}
            <p class="meta" style="margin-top:12px;">
                Feedback provided: {{ app.rejection_feedback_at.strftime("%Y-%m-%d %H:%M") }}
            </p>
        {% endif %}
    </div>
</div>
</body>
</html>
"""

NOTIFICATIONS_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Notifications</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: radial-gradient(circle at top left, #ecf4ff 0, #f8fbff 40%, #f5f7fb 100%);
            color: #111827;
        }
        .page { max-width: 720px; margin: 0 auto; padding: 32px 16px; }
        .back { margin-bottom: 16px; }
        .back a { color: #1d4ed8; font-weight: 600; text-decoration: none; font-size: 14px; }
        .card {
            background: #fff;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
            border: 1px solid rgba(148, 163, 184, 0.2);
        }
        ul { list-style: none; padding: 0; margin: 0; }
        li {
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
        }
        li.unread { background: #f0fdf4; margin: 0 -12px; padding: 12px; border-radius: 8px; border-bottom: none; margin-bottom: 8px; }
        .muted { color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
<div class="page">
    <p class="back"><a href="{{ url_for('view_applications', user=current_user_id) }}">&larr; back</a></p>
    <div class="card">
        <h1 style="margin-top:0;">Notifications</h1>
        <p class="muted">In-app notices when an application is rejected.</p>
        <ul>
        {% for n in notifications %}
            <li class="{% if not n.read %}unread{% endif %}">
                {{ n.message }}
                <div class="muted">{{ n.created_at.strftime("%Y-%m-%d %H:%M") }}{% if not n.read %} · Unread{% endif %}</div>
            </li>
        {% else %}
            <li>No notifications.</li>
        {% endfor %}
        </ul>
    </div>
</div>
</body>
</html>
"""


@app.route("/")
@app.route("/applications")
def view_applications():
    current_user_id = get_current_user_id()
    rejected_only = [
        dict(a)
        for a in APPLICATIONS
        if a["user_id"] == current_user_id and a["status"] == "Rejected"
    ]

    sort_order = request.args.get("sort", "desc")

    filtered = rejected_only

    reverse = sort_order != "asc"
    filtered = sorted(filtered, key=lambda a: a["applied_on"], reverse=reverse)

    view_rows = []
    for a in filtered:
        row = dict(a)
        row["unread"] = _unread_rejection(row, current_user_id)
        view_rows.append(row)

    return render_template_string(
        PAGE_TEMPLATE,
        applications=view_rows,
        has_any_rejected=len(rejected_only) > 0,
        current_user_id=current_user_id,
        sort_order=sort_order,
        unread_notifications=_unread_notifications(current_user_id),
    )


@app.route("/applications/<int:app_id>")
def application_detail(app_id: int):
    current_user_id = get_current_user_id()
    row = _application_by_id(app_id)
    if not row or row["user_id"] != current_user_id:
        abort(404)
    if not _is_rejected(row):
        abort(404)

    _mark_app_seen(current_user_id, app_id)
    _mark_notifs_for_app(current_user_id, app_id)

    return render_template_string(
        DETAIL_TEMPLATE,
        app=row,
        current_user_id=current_user_id,
    )


@app.route("/notifications")
def view_notifications():
    current_user_id = get_current_user_id()
    items = []
    for n in NOTIFICATIONS:
        if n["user_id"] == current_user_id:
            _mark_notif_read(current_user_id, n["id"])
            d = dict(n)
            d["read"] = True
            items.append(d)
    return render_template_string(
        NOTIFICATIONS_TEMPLATE,
        notifications=items,
        current_user_id=current_user_id,
    )


if __name__ == "__main__":
    app.run(debug=True)

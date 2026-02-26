import os
import shutil
import uuid
from pathlib import Path

from flask import Flask, request, jsonify, render_template, session

from job_seeker_application import (
    JobApplication,
    SUPPORTED_EXTENSIONS,
    MAX_FILE_SIZE_BYTES,
)

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")
app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_SIZE_BYTES

UPLOAD_BASE = Path(__file__).resolve().parent / "uploads"
UPLOAD_BASE.mkdir(exist_ok=True)
MAX_MB = MAX_FILE_SIZE_BYTES // (1024 * 1024)


def get_upload_dir():
    if "upload_id" not in session:
        session["upload_id"] = str(uuid.uuid4())
    d = UPLOAD_BASE / session["upload_id"]
    d.mkdir(exist_ok=True)
    return d


def session_app():
    app_state = JobApplication()
    resume = session.get("resume")
    if resume and Path(resume["path"]).exists():
        ok, _ = app_state.upload_resume(resume["path"], resume["filename"])
        if not ok:
            session.pop("resume", None)
    for doc in session.get("supporting", []):
        if Path(doc["path"]).exists():
            app_state.upload_supporting_document(doc["path"], doc["filename"])
    return app_state


@app.route("/")
def index():
    return render_template("attachResume.html", max_mb=MAX_MB, extensions=list(SUPPORTED_EXTENSIONS))


@app.route("/api/upload-resume", methods=["POST"])
def upload_resume():
    if "resume" not in request.files:
        return jsonify({"ok": False, "message": "No file selected."}), 400
    f = request.files["resume"]
    if not f or f.filename == "":
        return jsonify({"ok": False, "message": "No file selected."}), 400
    ext = Path(f.filename).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        return jsonify(
            {
                "ok": False,
                "message": "Unsupported file format. Only supported formats are PDF, DOC, DOCX.",
            }
        ), 400
    # Only allow one resume
    if session.get("resume"):
        return (
            jsonify(
                {
                    "ok": False,
                    "message": "You can upload only one resume. Please remove the current resume before uploading a new one.",
                }
            ),
            400,
        )
    upload_dir = get_upload_dir()
    safe_name = f.filename
    dest = upload_dir / safe_name
    f.save(str(dest))
    if dest.stat().st_size > MAX_FILE_SIZE_BYTES:
        dest.unlink()
        return jsonify({"ok": False, "message": f"File size exceeds maximum limit ({MAX_MB} MB)."}), 400
    # Remove old resume file if any
    old = session.get("resume")
    if old and Path(old["path"]).exists():
        Path(old["path"]).unlink(missing_ok=True)
    session["resume"] = {"path": str(dest), "filename": safe_name}
    session.modified = True
    return jsonify({"ok": True, "filename": safe_name})


@app.route("/api/upload-supporting", methods=["POST"])
def upload_supporting():
    if "file" not in request.files:
        return jsonify({"ok": False, "message": "No file selected."}), 400
    f = request.files["file"]
    if not f or f.filename == "":
        return jsonify({"ok": False, "message": "No file selected."}), 400
    ext = Path(f.filename).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        return jsonify(
            {
                "ok": False,
                "message": "Unsupported file format. Only supported formats are PDF, DOC, DOCX.",
            }
        ), 400
    upload_dir = get_upload_dir()
    safe_name = f.filename
    dest = upload_dir / safe_name
    f.save(str(dest))
    if dest.stat().st_size > MAX_FILE_SIZE_BYTES:
        dest.unlink()
        return jsonify({"ok": False, "message": f"File size exceeds maximum limit ({MAX_MB} MB)."}), 400
    supporting = session.get("supporting", [])
    supporting.append({"path": str(dest), "filename": safe_name})
    session["supporting"] = supporting
    session.modified = True
    return jsonify({"ok": True, "filename": safe_name, "index": len(supporting) - 1})


@app.route("/api/remove-resume", methods=["POST"])
def remove_resume():
    old = session.get("resume")
    if old and Path(old["path"]).exists():
        Path(old["path"]).unlink(missing_ok=True)
    session.pop("resume", None)
    session.modified = True
    return jsonify({"ok": True})


@app.route("/api/remove-supporting", methods=["POST"])
def remove_supporting():
    data = request.get_json() or {}
    index = data.get("index", 0)
    supporting = session.get("supporting", [])
    if 0 <= index < len(supporting):
        p = Path(supporting[index]["path"])
        if p.exists():
            p.unlink(missing_ok=True)
        supporting.pop(index)
        session["supporting"] = supporting
        session.modified = True
    return jsonify({"ok": True, "supporting": [d["filename"] for d in supporting]})


@app.route("/api/files", methods=["GET"])
def list_files():
    resume = session.get("resume")
    supporting = session.get("supporting", [])
    return jsonify({
        "resume": resume["filename"] if resume else None,
        "supporting": [d["filename"] for d in supporting],
    })


@app.route("/api/submit", methods=["POST"])
def submit():
    app_state = session_app()
    can, msg = app_state.can_submit()
    if not can:
        return jsonify({"ok": False, "message": msg}), 400
    success, msg = app_state.submit_application()
    if success:
        # Clear session uploads after submit
        upload_dir = UPLOAD_BASE / session.get("upload_id", "")
        if upload_dir.exists():
            shutil.rmtree(upload_dir, ignore_errors=True)
        session.pop("resume", None)
        session.pop("supporting", None)
        session.pop("upload_id", None)
        session.modified = True
    return jsonify({"ok": success, "message": msg})


if __name__ == "__main__":
    app.run(debug=True, port=5000)

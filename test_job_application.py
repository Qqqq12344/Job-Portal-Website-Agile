import os
import tempfile
from job_seeker_application import JobApplication

def create_temp_file(suffix=".pdf", size=1024):
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(b"a" * size)
    tmp.close()
    return tmp.name

def test_upload_valid_resume():
    app = JobApplication()
    file_path = create_temp_file(".pdf")

    ok, msg = app.upload_resume(file_path)

    assert ok is True
    assert app.has_resume() is True

    os.remove(file_path)


def test_upload_invalid_format():
    app = JobApplication()
    file_path = create_temp_file(".txt")

    ok, msg = app.upload_resume(file_path)

    assert ok is False
    assert "Unsupported file format" in msg

    os.remove(file_path)


def test_upload_file_too_large():
    app = JobApplication()
    # create file > 5MB
    file_path = create_temp_file(".pdf", size=6 * 1024 * 1024)

    ok, msg = app.upload_resume(file_path)

    assert ok is False
    assert "File size exceeds" in msg

    os.remove(file_path)


def test_submit_without_resume():
    app = JobApplication()

    ok, msg = app.submit_application()

    assert ok is False
    assert "no resume" in msg.lower()


def test_submit_success():
    app = JobApplication()
    file_path = create_temp_file(".pdf")

    app.upload_resume(file_path)
    ok, msg = app.submit_application()

    assert ok is True
    assert "successfully" in msg.lower()

    os.remove(file_path)
import io
import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


# ------------------ TEST CASES ------------------

def test_upload_resume_success(client):
    data = {
        "resume": (io.BytesIO(b"test file"), "resume.pdf")
    }

    response = client.post(
        "/api/upload-resume",
        data=data,
        content_type='multipart/form-data'
    )

    assert response.status_code == 200
    assert response.json["ok"] is True


def test_upload_resume_invalid_format(client):
    data = {
        "resume": (io.BytesIO(b"test"), "resume.txt")
    }

    response = client.post(
        "/api/upload-resume",
        data=data,
        content_type='multipart/form-data'
    )

    assert response.status_code == 400
    assert response.json["ok"] is False


def test_upload_multiple_resumes(client):
    # First upload (new file object)
    data1 = {
        "resume": (io.BytesIO(b"test"), "resume.pdf")
    }
    client.post("/api/upload-resume", data=data1, content_type='multipart/form-data')

    # Second upload (MUST be a new file object)
    data2 = {
        "resume": (io.BytesIO(b"test"), "resume.pdf")
    }
    response = client.post("/api/upload-resume", data=data2, content_type='multipart/form-data')

    assert response.status_code == 400
    assert "only one resume" in response.json["message"].lower()


def test_submit_without_resume(client):
    response = client.post("/api/submit")

    assert response.status_code == 400
    assert response.json["ok"] is False


def test_submit_success(client):
    data = {
        "resume": (io.BytesIO(b"test file"), "resume.pdf")
    }

    client.post("/api/upload-resume", data=data, content_type='multipart/form-data')
    response = client.post("/api/submit")

    assert response.status_code == 200
    assert response.json["ok"] is True
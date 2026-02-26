import os
from pathlib import Path
from typing import Optional

# Supported file extensions for resume and supporting documents
SUPPORTED_EXTENSIONS = {".pdf", ".doc", ".docx"}
# Maximum file size in bytes (5 MB)
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
UNSUPPORTED_FORMAT_MSG = "Unsupported file format. Only supported formats are PDF, DOC, DOCX."
FILE_TOO_LARGE_MSG = "File size exceeds maximum limit ({} MB)."
NO_RESUME_MSG = "Application cannot be submitted: no resume is attached."


class JobApplication:
    """Resume and supporting documents"""

    def __init__(self) -> None:
        self._resume: Optional[dict] = None  # {"path", "filename", "size"}
        self._supporting_docs: list[dict] = []

    def _validate_file(self, file_path: str, filename: Optional[str] = None) -> tuple[bool, Optional[str]]:
        """Validate file format and size"""
        path = Path(file_path)
        name = filename or path.name
        ext = Path(name).suffix.lower()
        if ext not in SUPPORTED_EXTENSIONS:
            return False, UNSUPPORTED_FORMAT_MSG
        if not path.exists():
            return False, "File not found."
        size = path.stat().st_size
        if size > MAX_FILE_SIZE_BYTES:
            max_mb = MAX_FILE_SIZE_BYTES // (1024 * 1024)
            return False, FILE_TOO_LARGE_MSG.format(max_mb)
        return True, None

    def upload_resume(self, file_path: str, filename: Optional[str] = None) -> tuple[bool, str]:
        """Upload resume"""
        ok, err = self._validate_file(file_path, filename)
        if not ok:
            return False, err
        path = Path(file_path)
        name = filename or path.name
        self._resume = {"path": str(path), "filename": name, "size": path.stat().st_size}
        return True, name

    def upload_supporting_document(self, file_path: str, filename: Optional[str] = None) -> tuple[bool, str]:
        """Upload supporting document"""
        ok, err = self._validate_file(file_path, filename)
        if not ok:
            return False, err
        path = Path(file_path)
        name = filename or path.name
        self._supporting_docs.append({"path": str(path), "filename": name, "size": path.stat().st_size})
        return True, name

    def remove_resume(self) -> bool:
        """Remove resume"""
        if self._resume is None:
            return False
        self._resume = None
        return True

    def remove_supporting_document(self, index: int) -> bool:
        """Remove supporting document"""
        if 0 <= index < len(self._supporting_docs):
            self._supporting_docs.pop(index)
            return True
        return False

    def get_uploaded_file_names(self) -> dict[str, list[str]]:
        """Display file name"""
        names = {"resume": [], "supporting": []}
        if self._resume:
            names["resume"] = [self._resume["filename"]]
        names["supporting"] = [d["filename"] for d in self._supporting_docs]
        return names

    def has_resume(self) -> bool:
        return self._resume is not None

    def can_submit(self) -> tuple[bool, str]:
        if not self.has_resume():
            return False, NO_RESUME_MSG
        return True, ""

    def submit_application(self) -> tuple[bool, str]:
        can, msg = self.can_submit()
        if not can:
            return False, msg
        return True, "Application submitted successfully."


def validate_file_format(file_path: str, filename: Optional[str] = None) -> tuple[bool, str]:
    path = Path(file_path)
    name = filename or path.name
    ext = Path(name).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        return False, UNSUPPORTED_FORMAT_MSG
    return True, name


def get_max_file_size_bytes() -> int:
    return MAX_FILE_SIZE_BYTES


def get_supported_extensions() -> set[str]:
    return SUPPORTED_EXTENSIONS.copy()


if __name__ == "__main__":
    
    app = JobApplication()
    print("Job Seeker Application Management")
    print("Supported formats:", ", ".join(SUPPORTED_EXTENSIONS))
    print("Max file size:", MAX_FILE_SIZE_BYTES // (1024 * 1024), "MB")
    print("\nExample: upload resume with full path, e.g. C:\\path\\to\\resume.pdf")
    path = input("Resume file path (or Enter to skip): ").strip()
    if path:
        ok, msg = app.upload_resume(path)
        print("Resume:", msg if ok else f"Error: {msg}")
    print("Uploaded:", app.get_uploaded_file_names())
    can, err = app.can_submit()
    print("Can submit:", can, err if not can else "")

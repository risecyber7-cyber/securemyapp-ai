from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl

from backend.app.models.enums import ScanType


class ProjectCreate(BaseModel):
    workspace_id: str
    name: str = Field(min_length=2, max_length=120)
    description: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = None
    target_type: str | None = Field(default=None, max_length=32)
    target_value: str | None = None
    detected_stack: str | None = None


class ProjectOut(BaseModel):
    id: str
    workspace_id: str
    name: str
    description: str | None = None
    created_at: datetime


class RepositoryTargetCreate(BaseModel):
    workspace_id: str
    project_id: str | None = None
    provider: str = "local"
    repository_name: str = Field(min_length=2, max_length=255)
    repository_url: HttpUrl | None = None
    default_branch: str = "main"
    codebase_path: str | None = None


class RepositoryTargetOut(BaseModel):
    id: str
    workspace_id: str
    project_id: str | None = None
    provider: str
    repository_name: str
    repository_url: str | None = None
    default_branch: str
    codebase_path: str | None = None
    validation_state: str
    created_at: datetime


class ProjectScanGroupOut(BaseModel):
    project_id: str | None = None
    project_name: str
    scan_count: int
    scan_types: list[ScanType]

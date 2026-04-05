from datetime import datetime

from pydantic import BaseModel, HttpUrl


class TargetCreate(BaseModel):
    workspace_id: str
    project_id: str | None = None
    base_url: HttpUrl


class TargetOut(BaseModel):
    id: str
    workspace_id: str
    project_id: str | None = None
    base_url: str
    verification_state: str
    verification_details: dict
    created_at: datetime

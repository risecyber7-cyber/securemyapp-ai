from datetime import datetime

from pydantic import BaseModel

from backend.app.models.enums import ReportAudience


class ReportCreate(BaseModel):
    scan_id: str
    audience: ReportAudience
    format: str = "json"


class ReportGenerateRequest(BaseModel):
    scan_id: str
    audience: ReportAudience
    format: str = "json"


class ReportOut(BaseModel):
    id: str
    scan_id: str
    audience: ReportAudience
    format: str
    summary: dict
    remediation_plan: dict
    artifact_url: str | None = None
    created_at: datetime

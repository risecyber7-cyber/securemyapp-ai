from datetime import datetime

from pydantic import BaseModel, Field

from backend.app.models.enums import ScanStatus, ScanType, SeverityLevel


class ScanCreate(BaseModel):
    workspace_id: str
    scan_type: ScanType
    project_id: str | None = None
    repo_path: str | None = None
    repository_target_id: str | None = None
    target_site_id: str | None = None
    public_website_url: str | None = None
    uploaded_code_snippets: list[str] = Field(default_factory=list)
    pasted_headers: str | None = None
    pasted_api_responses: list[str] = Field(default_factory=list)
    pasted_js_bundles: list[str] = Field(default_factory=list)
    framework_hints: list[str] = Field(default_factory=list)


class ScanOut(BaseModel):
    id: str
    workspace_id: str | None = None
    scan_type: ScanType
    status: ScanStatus
    project_id: str | None = None
    repo_path: str | None = None
    repository_target_id: str | None = None
    target_site_id: str | None = None
    framework_hints: list[str]
    normalized_summary: dict
    failure_reason: str | None = None
    created_at: datetime


class ScanCancelResponse(BaseModel):
    status: str
    message: str


class FindingOut(BaseModel):
    id: str
    scan_id: str
    source: str
    category: str
    severity: SeverityLevel
    confidence: str
    title: str
    description: str
    framework: str
    file_path: str | None = None
    line_start: int | None = None
    line_end: int | None = None
    url: str | None = None
    evidence: dict
    cwe_ids: list[str]
    owasp_tags: list[str]
    fix_available: bool = True
    false_positive: bool = False
    status: str = "open"
    assigned_to_user_id: str | None = None
    business_impact: str | None = None
    ai_notes: str | None = None


class FindingStatusUpdate(BaseModel):
    status: str | None = Field(default=None, min_length=3, max_length=32)
    false_positive: bool | None = None
    assigned_to_user_id: str | None = None
class SafeExplanation(BaseModel):
    title: str
    summary: str
    technical_explanation: str
    why_it_matters: str
    likely_causes: str
    safe_business_impact: str
    remediation_overview: str


class RemediationOut(BaseModel):
    id: str
    finding_id: str
    title: str
    explanation: str
    patch_diff: str | None
    code_snippet: str
    references: list[str]
    validation_steps: list[str]
    review_required: bool
    confidence_score: int
    before_code: str | None = None
    after_code: str | None = None
    middleware_example: str | None = None
    secure_config_example: str | None = None
    structured_explanation: SafeExplanation | None = None

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.core.database import Base
from backend.app.models.enums import MembershipRole, ReportAudience, ScanStatus, ScanType, SeverityLevel


def generate_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:10]}"


class CreatedAtMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class User(CreatedAtMixin, Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: generate_id("usr"))
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[str] = mapped_column(String(32), default=MembershipRole.VIEWER.value)

    memberships: Mapped[list["WorkspaceMembership"]] = relationship(back_populates="user")
    sessions: Mapped[list["UserSession"]] = relationship(back_populates="user")

    @property
    def full_name(self) -> str:
        return self.name

    @full_name.setter
    def full_name(self, value: str) -> None:
        self.name = value

    @property
    def is_active(self) -> bool:
        return True

    @is_active.setter
    def is_active(self, _value: bool) -> None:
        return

    @property
    def email_verified_at(self) -> datetime | None:
        return self.created_at if self.is_verified else None

    @email_verified_at.setter
    def email_verified_at(self, value: datetime | None) -> None:
        self.is_verified = value is not None


class Workspace(CreatedAtMixin, Base):
    __tablename__ = "workspaces"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: generate_id("ws"))
    name: Mapped[str] = mapped_column(String(255), index=True)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    plan: Mapped[str] = mapped_column(String(32), default="starter")

    owner: Mapped["User"] = relationship()
    memberships: Mapped[list["WorkspaceMembership"]] = relationship(back_populates="workspace")
    targets: Mapped[list["TargetSite"]] = relationship(back_populates="workspace")
    repositories: Mapped[list["RepositoryTarget"]] = relationship(back_populates="workspace")
    projects: Mapped[list["Project"]] = relationship(back_populates="workspace")
    scans: Mapped[list["ScanRun"]] = relationship(back_populates="workspace")


class WorkspaceMembership(CreatedAtMixin, Base):
    __tablename__ = "workspace_members"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: generate_id("wm"))
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    role: Mapped[MembershipRole] = mapped_column(Enum(MembershipRole), default=MembershipRole.VIEWER)

    workspace: Mapped["Workspace"] = relationship(back_populates="memberships")
    user: Mapped["User"] = relationship(back_populates="memberships")


class Project(CreatedAtMixin, Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: generate_id("proj"))
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id"))
    name: Mapped[str] = mapped_column(String(255))
    target_type: Mapped[str] = mapped_column(String(32), default="website")
    target_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    detected_stack: Mapped[str | None] = mapped_column(Text, nullable=True)

    workspace: Mapped["Workspace"] = relationship(back_populates="projects")
    sites: Mapped[list["TargetSite"]] = relationship(back_populates="project")
    repositories: Mapped[list["RepositoryTarget"]] = relationship(back_populates="project")

    @property
    def description(self) -> str | None:
        return self.target_value

    @description.setter
    def description(self, value: str | None) -> None:
        self.target_value = value


class ScanRun(CreatedAtMixin, Base):
    __tablename__ = "scans"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: generate_id("scan"))
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    status: Mapped[ScanStatus] = mapped_column(Enum(ScanStatus), default=ScanStatus.QUEUED)
    scan_mode: Mapped[str] = mapped_column(String(32), default=ScanType.FULL.value)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    summary_json: Mapped[dict] = mapped_column(JSON, default=dict)

    workspace_id: Mapped[str | None] = mapped_column(ForeignKey("workspaces.id"), nullable=True)
    created_by_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    repo_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    repository_target_id: Mapped[str | None] = mapped_column(ForeignKey("repository_targets.id"), nullable=True)
    target_site_id: Mapped[str | None] = mapped_column(ForeignKey("target_sites.id"), nullable=True)
    framework_hints: Mapped[list[str]] = mapped_column(JSON, default=list)
    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    workspace: Mapped["Workspace | None"] = relationship(back_populates="scans")

    @property
    def scan_type(self) -> ScanType:
        return ScanType(self.scan_mode)

    @scan_type.setter
    def scan_type(self, value: ScanType | str) -> None:
        self.scan_mode = value.value if isinstance(value, ScanType) else value

    @property
    def normalized_summary(self) -> dict:
        return self.summary_json

    @normalized_summary.setter
    def normalized_summary(self, value: dict) -> None:
        self.summary_json = value


class Finding(CreatedAtMixin, Base):
    __tablename__ = "issues"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: generate_id("issue"))
    scan_id: Mapped[str] = mapped_column(ForeignKey("scans.id"), index=True)
    category: Mapped[str] = mapped_column(String(128))
    title: Mapped[str] = mapped_column(String(255))
    severity: Mapped[SeverityLevel] = mapped_column(Enum(SeverityLevel))
    confidence: Mapped[str] = mapped_column(String(32))
    description: Mapped[str] = mapped_column(Text)
    evidence_json: Mapped[dict] = mapped_column(JSON, default=dict)
    location: Mapped[str | None] = mapped_column(String(512), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="open")

    source: Mapped[str] = mapped_column(String(32), default="static")
    framework: Mapped[str] = mapped_column(String(64), default="generic")
    cwe_ids: Mapped[list[str]] = mapped_column(JSON, default=list)
    owasp_tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    fix_available: Mapped[bool] = mapped_column(Boolean, default=True)
    false_positive: Mapped[bool] = mapped_column(Boolean, default=False)
    assigned_to_user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    business_impact: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    line_start: Mapped[int | None] = mapped_column(Integer, nullable=True)
    line_end: Mapped[int | None] = mapped_column(Integer, nullable=True)

    @property
    def evidence(self) -> dict:
        return self.evidence_json

    @evidence.setter
    def evidence(self, value: dict) -> None:
        self.evidence_json = value

    @property
    def file_path(self) -> str | None:
        return self.location if self.location and not self.location.startswith("http") else None

    @file_path.setter
    def file_path(self, value: str | None) -> None:
        if value:
          self.location = value

    @property
    def url(self) -> str | None:
        return self.location if self.location and self.location.startswith("http") else None

    @url.setter
    def url(self, value: str | None) -> None:
        if value:
          self.location = value


class Remediation(CreatedAtMixin, Base):
    __tablename__ = "fixes"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: generate_id("fix"))
    issue_id: Mapped[str] = mapped_column(ForeignKey("issues.id"), unique=True)
    framework: Mapped[str] = mapped_column(String(64), default="generic")
    language: Mapped[str | None] = mapped_column(String(32), nullable=True)
    fix_title: Mapped[str] = mapped_column(String(255))
    explanation: Mapped[str] = mapped_column(Text)
    code_before: Mapped[str | None] = mapped_column(Text, nullable=True)
    code_after: Mapped[str | None] = mapped_column(Text, nullable=True)
    config_patch: Mapped[str | None] = mapped_column(Text, nullable=True)
    manual_steps: Mapped[list[str]] = mapped_column(JSON, default=list)
    confidence: Mapped[int] = mapped_column(Integer, default=70)

    patch_diff: Mapped[str | None] = mapped_column(Text, nullable=True)
    code_snippet: Mapped[str | None] = mapped_column(Text, nullable=True)
    references: Mapped[list[str]] = mapped_column(JSON, default=list)
    review_required: Mapped[bool] = mapped_column(Boolean, default=True)
    middleware_example: Mapped[str | None] = mapped_column(Text, nullable=True)
    secure_config_example: Mapped[str | None] = mapped_column(Text, nullable=True)
    structured_explanation: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    @property
    def finding_id(self) -> str:
        return self.issue_id

    @finding_id.setter
    def finding_id(self, value: str) -> None:
        self.issue_id = value

    @property
    def title(self) -> str:
        return self.fix_title

    @title.setter
    def title(self, value: str) -> None:
        self.fix_title = value

    @property
    def validation_steps(self) -> list[str]:
        return self.manual_steps

    @validation_steps.setter
    def validation_steps(self, value: list[str]) -> None:
        self.manual_steps = value

    @property
    def confidence_score(self) -> int:
        return self.confidence

    @confidence_score.setter
    def confidence_score(self, value: int) -> None:
        self.confidence = value

    @property
    def before_code(self) -> str | None:
        return self.code_before

    @before_code.setter
    def before_code(self, value: str | None) -> None:
        self.code_before = value

    @property
    def after_code(self) -> str | None:
        return self.code_after

    @after_code.setter
    def after_code(self, value: str | None) -> None:
        self.code_after = value


class Report(CreatedAtMixin, Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: generate_id("report"))
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    scan_id: Mapped[str | None] = mapped_column(ForeignKey("scans.id"), nullable=True)
    report_type: Mapped[str] = mapped_column(String(32), default=ReportAudience.DEVELOPER.value)
    storage_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    format: Mapped[str] = mapped_column(String(16), default="json")
    summary: Mapped[dict] = mapped_column(JSON, default=dict)
    remediation_plan: Mapped[dict] = mapped_column(JSON, default=dict)

    @property
    def audience(self) -> ReportAudience:
        return ReportAudience(self.report_type if self.report_type in ReportAudience._value2member_map_ else ReportAudience.DEVELOPER.value)

    @audience.setter
    def audience(self, value: ReportAudience | str) -> None:
        self.report_type = value.value if isinstance(value, ReportAudience) else value

    @property
    def artifact_url(self) -> str | None:
        return self.storage_url

    @artifact_url.setter
    def artifact_url(self, value: str | None) -> None:
        self.storage_url = value


class TargetSite(CreatedAtMixin, Base):
    __tablename__ = "target_sites"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: generate_id("site"))
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id"))
    base_url: Mapped[str] = mapped_column(String(512))
    verification_state: Mapped[str] = mapped_column(String(32), default="pending")
    verification_details: Mapped[dict] = mapped_column(JSON, default=dict)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)

    workspace: Mapped["Workspace"] = relationship(back_populates="targets")
    project: Mapped["Project | None"] = relationship(back_populates="sites")


class RepositoryTarget(CreatedAtMixin, Base):
    __tablename__ = "repository_targets"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: generate_id("repo"))
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id"))
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    provider: Mapped[str] = mapped_column(String(32), default="local")
    repository_name: Mapped[str] = mapped_column(String(255))
    repository_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    default_branch: Mapped[str] = mapped_column(String(128), default="main")
    codebase_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    validation_state: Mapped[str] = mapped_column(String(32), default="pending")

    workspace: Mapped["Workspace"] = relationship(back_populates="repositories")
    project: Mapped["Project | None"] = relationship(back_populates="repositories")


class EmailVerificationToken(CreatedAtMixin, Base):
    __tablename__ = "email_verification_tokens"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: generate_id("evt"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class PasswordResetToken(CreatedAtMixin, Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: generate_id("prt"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class UserSession(CreatedAtMixin, Base):
    __tablename__ = "user_sessions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: generate_id("sess"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    access_token: Mapped[str] = mapped_column(Text)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship(back_populates="sessions")


class AuditLog(CreatedAtMixin, Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: generate_id("audit"))
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(128))
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    workspace_id: Mapped[str | None] = mapped_column(ForeignKey("workspaces.id"), nullable=True)
    entity_type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    entity_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    @property
    def actor_user_id(self) -> str | None:
        return self.user_id

    @actor_user_id.setter
    def actor_user_id(self, value: str | None) -> None:
        self.user_id = value

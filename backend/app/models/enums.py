from enum import StrEnum


class MembershipRole(StrEnum):
    OWNER = "owner"
    ADMIN = "admin"
    SECURITY_ENGINEER = "security_engineer"
    DEVELOPER = "developer"
    VIEWER = "viewer"


class ScanType(StrEnum):
    REPO = "repo"
    WEBSITE = "website"
    FULL = "full"


class ScanStatus(StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class SeverityLevel(StrEnum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class ReportAudience(StrEnum):
    DEVELOPER = "developer"
    STAKEHOLDER = "stakeholder"

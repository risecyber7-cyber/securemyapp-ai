from datetime import datetime, timezone

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.config import get_settings
from backend.app.core.database import get_db
from backend.app.models.entities import Finding, Project, Remediation, Report, ScanRun, TargetSite, User, WorkspaceMembership
from backend.app.models.enums import MembershipRole
from backend.app.services.rbac import role_allows


AUTH_ERROR = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
FORBIDDEN_ERROR = HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient access")


def _get_membership(db: Session, user_id: str, workspace_id: str | None = None) -> WorkspaceMembership | None:
    query = select(WorkspaceMembership).where(WorkspaceMembership.user_id == user_id)
    if workspace_id:
        query = query.where(WorkspaceMembership.workspace_id == workspace_id)
    return db.scalar(query)


def get_current_actor(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> dict:
    settings = get_settings()

    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        except JWTError as exc:
            raise AUTH_ERROR from exc

        user_id = payload.get("sub")
        if not user_id:
            raise AUTH_ERROR
        user = db.scalar(select(User).where(User.id == user_id))
        if not user:
            raise AUTH_ERROR

        workspace_id = payload.get("workspace_id")
        membership = _get_membership(db, user.id, workspace_id)
        return {
            "user": user,
            "workspace_id": membership.workspace_id if membership else workspace_id,
            "role": membership.role if membership else payload.get("role") or MembershipRole.VIEWER,
        }

    if settings.allow_demo_auth and settings.is_development:
        demo_user = db.scalar(select(User).limit(1))
        if demo_user:
            membership = _get_membership(db, demo_user.id)
            return {
                "user": demo_user,
                "workspace_id": membership.workspace_id if membership else None,
                "role": membership.role if membership else MembershipRole.OWNER,
            }
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No demo user available")

    raise AUTH_ERROR


def require_workspace_role(required_role: MembershipRole):
    def dependency(actor: dict = Depends(get_current_actor)) -> dict:
        actor_role = MembershipRole(actor["role"])
        if not role_allows(actor_role, required_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return actor

    return dependency


def ensure_workspace_access(actor: dict, db: Session, workspace_id: str, required_role: MembershipRole = MembershipRole.VIEWER) -> None:
    membership = _get_membership(db, actor["user"].id, workspace_id)
    if not membership or not role_allows(membership.role, required_role):
        raise FORBIDDEN_ERROR


def ensure_project_access(actor: dict, db: Session, project_id: str, required_role: MembershipRole = MembershipRole.VIEWER) -> Project:
    project = db.scalar(select(Project).where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    ensure_workspace_access(actor, db, project.workspace_id, required_role)
    return project


def ensure_scan_access(actor: dict, db: Session, scan_id: str, required_role: MembershipRole = MembershipRole.VIEWER) -> ScanRun:
    scan = db.scalar(select(ScanRun).where(ScanRun.id == scan_id))
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    if scan.workspace_id:
        ensure_workspace_access(actor, db, scan.workspace_id, required_role)
    return scan


def ensure_finding_access(actor: dict, db: Session, finding_id: str, required_role: MembershipRole = MembershipRole.VIEWER) -> Finding:
    finding = db.scalar(select(Finding).where(Finding.id == finding_id))
    if not finding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")
    scan = ensure_scan_access(actor, db, finding.scan_id, required_role)
    if not scan:
        raise FORBIDDEN_ERROR
    return finding


def ensure_fix_access(actor: dict, db: Session, fix_id: str, required_role: MembershipRole = MembershipRole.VIEWER) -> Remediation:
    remediation = db.scalar(select(Remediation).where(Remediation.id == fix_id))
    if not remediation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fix not found")
    ensure_finding_access(actor, db, remediation.issue_id, required_role)
    return remediation


def ensure_report_access(actor: dict, db: Session, report_id: str, required_role: MembershipRole = MembershipRole.VIEWER) -> Report:
    report = db.scalar(select(Report).where(Report.id == report_id))
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    if report.scan_id:
        ensure_scan_access(actor, db, report.scan_id, required_role)
    elif report.project_id:
        ensure_project_access(actor, db, report.project_id, required_role)
    return report


def ensure_target_access(actor: dict, db: Session, target_id: str, required_role: MembershipRole = MembershipRole.VIEWER) -> TargetSite:
    target = db.scalar(select(TargetSite).where(TargetSite.id == target_id))
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target not found")
    ensure_workspace_access(actor, db, target.workspace_id, required_role)
    return target

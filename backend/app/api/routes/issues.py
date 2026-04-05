from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.dependencies import ensure_finding_access, ensure_scan_access, get_current_actor, require_workspace_role
from backend.app.models.entities import Finding
from backend.app.models.enums import MembershipRole
from backend.app.schemas.scan import FindingOut, FindingStatusUpdate
from backend.app.services.audit_service import record_audit_event

router = APIRouter(prefix="/issues", tags=["issues"])


@router.get("", response_model=list[FindingOut])
def list_issues(
    scan_id: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    actor: dict = Depends(get_current_actor),
    _: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> list[FindingOut]:
    query = select(Finding)
    if scan_id:
        ensure_scan_access(actor, db, scan_id)
        query = query.where(Finding.scan_id == scan_id)
    findings = db.scalars(query).all()
    visible = []
    for finding in findings:
        try:
            ensure_finding_access(actor, db, finding.id)
            if status_filter and finding.status != status_filter:
                continue
            visible.append(finding)
        except HTTPException:
            continue
    return visible


@router.get("/{issue_id}", response_model=FindingOut)
def get_issue(
    issue_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> FindingOut:
    return ensure_finding_access(actor, db, issue_id)


@router.patch("/{issue_id}/status", response_model=FindingOut)
def update_issue_status(
    issue_id: str,
    payload: FindingStatusUpdate,
    actor: dict = Depends(get_current_actor),
    _: dict = Depends(require_workspace_role(MembershipRole.DEVELOPER)),
    db: Session = Depends(get_db),
) -> FindingOut:
    issue = ensure_finding_access(actor, db, issue_id, MembershipRole.DEVELOPER)
    provided_fields = payload.model_fields_set
    changed_fields: dict = {}
    if "status" in provided_fields and payload.status is not None and payload.status != issue.status:
        changed_fields["status"] = {"from": issue.status, "to": payload.status}
        issue.status = payload.status
    if "false_positive" in provided_fields and payload.false_positive is not None and payload.false_positive != issue.false_positive:
        changed_fields["false_positive"] = {"from": issue.false_positive, "to": payload.false_positive}
        issue.false_positive = payload.false_positive
    if "assigned_to_user_id" in provided_fields and payload.assigned_to_user_id != issue.assigned_to_user_id:
        changed_fields["assigned_to_user_id"] = {"from": issue.assigned_to_user_id, "to": payload.assigned_to_user_id}
        issue.assigned_to_user_id = payload.assigned_to_user_id
    if changed_fields:
        record_audit_event(
            db,
            action="issue.updated",
            entity_type="issue",
            entity_id=issue.id,
            actor_user_id=actor["user"].id,
            workspace_id=actor.get("workspace_id"),
            metadata=changed_fields,
        )
    db.commit()
    db.refresh(issue)
    return issue

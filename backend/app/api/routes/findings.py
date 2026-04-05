from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.dependencies import ensure_finding_access, get_current_actor, require_workspace_role
from backend.app.models.entities import Remediation
from backend.app.models.enums import MembershipRole
from backend.app.schemas.scan import FindingOut, FindingStatusUpdate, RemediationOut
from backend.app.services.audit_service import record_audit_event
from backend.app.services.fix_generation_service import generate_exact_fix

router = APIRouter(prefix="/findings", tags=["findings"])


@router.get("/{finding_id}", response_model=FindingOut)
def get_finding(
    finding_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> FindingOut:
    return ensure_finding_access(actor, db, finding_id)


@router.patch("/{finding_id}/status", response_model=FindingOut)
def update_finding_status(
    finding_id: str,
    payload: FindingStatusUpdate,
    actor: dict = Depends(get_current_actor),
    _: dict = Depends(require_workspace_role(MembershipRole.DEVELOPER)),
    db: Session = Depends(get_db),
) -> FindingOut:
    finding = ensure_finding_access(actor, db, finding_id, MembershipRole.DEVELOPER)
    provided_fields = payload.model_fields_set
    changed_fields: dict = {}
    if "status" in provided_fields and payload.status is not None and payload.status != finding.status:
        changed_fields["status"] = {"from": finding.status, "to": payload.status}
        finding.status = payload.status
    if "false_positive" in provided_fields and payload.false_positive is not None and payload.false_positive != finding.false_positive:
        changed_fields["false_positive"] = {"from": finding.false_positive, "to": payload.false_positive}
        finding.false_positive = payload.false_positive
    if "assigned_to_user_id" in provided_fields and payload.assigned_to_user_id != finding.assigned_to_user_id:
        changed_fields["assigned_to_user_id"] = {"from": finding.assigned_to_user_id, "to": payload.assigned_to_user_id}
        finding.assigned_to_user_id = payload.assigned_to_user_id
    if changed_fields:
        record_audit_event(
            db,
            action="finding.updated",
            entity_type="finding",
            entity_id=finding.id,
            actor_user_id=actor["user"].id,
            workspace_id=actor.get("workspace_id"),
            metadata=changed_fields,
        )
    db.commit()
    db.refresh(finding)
    return finding


@router.get("/{finding_id}/remediation", response_model=RemediationOut)
def get_remediation(
    finding_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> RemediationOut:
    finding = ensure_finding_access(actor, db, finding_id)
    remediation = db.scalar(select(Remediation).where(Remediation.finding_id == finding_id))
    if remediation:
        return remediation

    generated = generate_exact_fix(
        finding_id,
        {
            "title": finding.title,
            "category": finding.category,
            "framework": finding.framework,
            "file_path": finding.file_path,
            "description": finding.description,
            "cwe_ids": finding.cwe_ids,
            "owasp_tags": finding.owasp_tags,
            "evidence": finding.evidence,
            "severity": finding.severity.value,
        },
        {"framework": finding.framework},
    )
    remediation = Remediation(issue_id=finding_id, framework=finding.framework, fix_title=generated.title, explanation=generated.explanation)
    db.add(remediation)
    remediation.language = finding.framework or "generic"
    remediation.code_before = generated.before_code
    remediation.code_after = generated.after_code or generated.code_snippet
    remediation.config_patch = generated.secure_config_example or generated.patch_diff
    remediation.manual_steps = generated.validation_steps
    remediation.confidence = generated.confidence_score
    remediation.patch_diff = generated.patch_diff
    remediation.code_snippet = generated.code_snippet
    remediation.references = generated.references
    remediation.review_required = generated.review_required
    remediation.middleware_example = generated.middleware_example
    remediation.secure_config_example = generated.secure_config_example
    remediation.structured_explanation = generated.structured_explanation.model_dump() if generated.structured_explanation else None
    db.commit()
    db.refresh(remediation)
    return remediation

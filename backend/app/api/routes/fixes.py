from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.dependencies import ensure_finding_access, ensure_fix_access, require_workspace_role
from backend.app.models.entities import Remediation
from backend.app.models.enums import MembershipRole
from backend.app.schemas.scan import RemediationOut
from backend.app.services.fix_generation_service import generate_exact_fix

router = APIRouter(prefix="/fixes", tags=["fixes"])


@router.get("", response_model=list[RemediationOut])
def list_fixes(
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> list[RemediationOut]:
    remediations = db.scalars(select(Remediation).order_by(Remediation.created_at.desc())).all()
    visible: list[Remediation] = []
    for remediation in remediations:
        try:
            ensure_finding_access(actor, db, remediation.issue_id)
            visible.append(remediation)
        except HTTPException:
            continue
    return visible


@router.get("/{fix_id}", response_model=RemediationOut)
def get_fix(
    fix_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> RemediationOut:
    return ensure_fix_access(actor, db, fix_id)


@router.post("/{issue_id}/regenerate", response_model=RemediationOut)
def regenerate_fix(
    issue_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.DEVELOPER)),
    db: Session = Depends(get_db),
) -> RemediationOut:
    issue = ensure_finding_access(actor, db, issue_id, MembershipRole.DEVELOPER)
    remediation = db.scalar(select(Remediation).where(Remediation.issue_id == issue_id))
    generated = generate_exact_fix(
        issue_id,
        {
            "title": issue.title,
            "category": issue.category,
            "framework": issue.framework,
            "file_path": issue.file_path,
            "description": issue.description,
            "cwe_ids": issue.cwe_ids,
            "owasp_tags": issue.owasp_tags,
            "severity": issue.severity.value,
            "evidence": issue.evidence,
        },
        {"framework": issue.framework},
    )
    if remediation is None:
        remediation = Remediation(issue_id=issue_id, framework=issue.framework, fix_title=generated.title, explanation=generated.explanation)
        db.add(remediation)
    remediation.framework = issue.framework
    remediation.language = issue.framework or remediation.language or "generic"
    remediation.fix_title = generated.title
    remediation.explanation = generated.explanation
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

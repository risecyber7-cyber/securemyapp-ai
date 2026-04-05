from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.dependencies import ensure_workspace_access, get_current_actor, require_workspace_role
from backend.app.models.entities import TargetSite
from backend.app.models.enums import MembershipRole
from backend.app.schemas.target import TargetCreate, TargetOut
from backend.app.services.audit_service import record_audit_event
from backend.app.services.target_validator import validate_target_ownership

router = APIRouter(prefix="/targets", tags=["targets"])


@router.post("/sites", response_model=TargetOut, status_code=status.HTTP_201_CREATED)
def create_target(
    payload: TargetCreate,
    actor: dict = Depends(get_current_actor),
    _: dict = Depends(require_workspace_role(MembershipRole.DEVELOPER)),
    db: Session = Depends(get_db),
) -> TargetOut:
    ensure_workspace_access(actor, db, payload.workspace_id, MembershipRole.DEVELOPER)
    details = validate_target_ownership(str(payload.base_url))
    target = TargetSite(
        workspace_id=payload.workspace_id,
        project_id=payload.project_id,
        base_url=str(payload.base_url),
        verification_state="validated",
        verification_details=details,
    )
    db.add(target)
    db.flush()
    record_audit_event(
        db,
        action="target.created",
        entity_type="target_site",
        entity_id=target.id,
        actor_user_id=actor["user"].id,
        workspace_id=payload.workspace_id,
        metadata=details,
    )
    db.commit()
    db.refresh(target)
    return target

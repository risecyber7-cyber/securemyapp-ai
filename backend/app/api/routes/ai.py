from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.dependencies import ensure_workspace_access, get_current_actor, require_workspace_role
from backend.app.models.enums import MembershipRole
from backend.app.schemas.ai import AssistantRequest, AssistantResponse
from backend.app.services.ai_service import explain_issue_and_answer

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/assistant", response_model=AssistantResponse)
def assistant_route(
    payload: AssistantRequest,
    actor: dict = Depends(get_current_actor),
    _: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> AssistantResponse:
    ensure_workspace_access(actor, db, payload.workspace_id)
    return explain_issue_and_answer(db, payload.workspace_id, payload.prompt, payload.project_id)

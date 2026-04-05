from fastapi import APIRouter, Depends

from backend.app.dependencies import ensure_workspace_access, get_current_actor, require_workspace_role
from backend.app.models.enums import MembershipRole
from backend.app.services.notification_service import build_weekly_summary_payload

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
def get_settings(actor: dict = Depends(get_current_actor), _: dict = Depends(require_workspace_role(MembershipRole.ADMIN))) -> dict:
    workspace_id = actor.get("workspace_id") or "workspace-placeholder"
    return {
        "profile": {
            "full_name": actor["user"].full_name,
            "email": actor["user"].email,
            "role": actor.get("role"),
        },
        "notifications": {
            "email_verification": True,
            "scan_complete": True,
            "weekly_summary": build_weekly_summary_payload(workspace_id),
        },
        "reporting": {
            "formats": ["markdown", "html", "pdf", "json"],
            "branding": "default",
        },
        "scans": {
            "modes": ["quick", "standard", "deep-safe"],
            "safe_scan_only": True,
        },
        "ai": {
            "provider": "openrouter",
            "server_side_only": True,
        },
    }

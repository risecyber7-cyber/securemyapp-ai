from sqlalchemy.orm import Session

from backend.app.services.audit_service import record_audit_event


def send_email_verification_notification(db: Session, user_id: str, email: str) -> dict:
    payload = {
        "channel": "email",
        "template": "verify-email",
        "recipient": email,
        "status": "queued",
    }
    record_audit_event(
        db,
        action="notification.email_verification_queued",
        entity_type="user",
        entity_id=user_id,
        actor_user_id=user_id,
        metadata=payload,
    )
    return payload


def send_scan_completed_notification(db: Session, workspace_id: str, scan_id: str, recipients: list[str]) -> dict:
    payload = {
        "channel": "email",
        "template": "scan-complete",
        "recipients": recipients,
        "scan_id": scan_id,
        "status": "queued",
    }
    record_audit_event(
        db,
        action="notification.scan_completed_queued",
        entity_type="scan",
        entity_id=scan_id,
        workspace_id=workspace_id,
        metadata=payload,
    )
    return payload


def build_weekly_summary_payload(workspace_id: str) -> dict:
    return {
        "workspace_id": workspace_id,
        "status": "planned",
        "template": "weekly-summary",
        "notes": ["Weekly summary email pipeline placeholder created."],
    }

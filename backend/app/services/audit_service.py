from sqlalchemy.orm import Session

from backend.app.models.entities import AuditLog


def record_audit_event(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    actor_user_id: str | None = None,
    workspace_id: str | None = None,
    metadata: dict | None = None,
) -> AuditLog:
    event = AuditLog(
        actor_user_id=actor_user_id,
        workspace_id=workspace_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata_json=metadata or {},
    )
    db.add(event)
    db.flush()
    return event

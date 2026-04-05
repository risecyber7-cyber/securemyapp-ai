from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.entities import Remediation


def get_fix_for_issue(db: Session, issue_id: str) -> Remediation | None:
    return db.scalar(select(Remediation).where(Remediation.finding_id == issue_id))

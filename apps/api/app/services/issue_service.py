from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.entities import Finding


def list_issues(db: Session, scan_id: str | None = None) -> list[Finding]:
    query = select(Finding)
    if scan_id:
        query = query.where(Finding.scan_id == scan_id)
    return db.scalars(query).all()


def get_issue(db: Session, issue_id: str) -> Finding | None:
    return db.scalar(select(Finding).where(Finding.id == issue_id))

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.dependencies import ensure_report_access, ensure_scan_access, get_current_actor, require_workspace_role
from backend.app.models.entities import Report
from backend.app.models.enums import MembershipRole
from backend.app.schemas.report import ReportCreate, ReportGenerateRequest, ReportOut
from backend.app.services.report_service import create_report_artifact, render_report_preview

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    actor: dict = Depends(get_current_actor),
    _: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> ReportOut:
    ensure_scan_access(actor, db, payload.scan_id)
    try:
        return create_report_artifact(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/generate", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def generate_report(
    payload: ReportGenerateRequest,
    actor: dict = Depends(get_current_actor),
    _: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> ReportOut:
    ensure_scan_access(actor, db, payload.scan_id)
    try:
        return create_report_artifact(db, ReportCreate(**payload.model_dump()))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("", response_model=list[ReportOut])
def list_reports(
    scan_id: str | None = None,
    actor: dict = Depends(get_current_actor),
    _: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> list[ReportOut]:
    query = select(Report)
    reports = db.scalars(query.order_by(Report.created_at.desc())).all()
    visible = []
    for report in reports:
        try:
            ensure_report_access(actor, db, report.id)
            if scan_id and report.scan_id != scan_id:
                continue
            visible.append(report)
        except HTTPException:
            continue
    return visible


@router.get("/{report_id}", response_model=ReportOut)
def get_report(
    report_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> ReportOut:
    return ensure_report_access(actor, db, report_id)


@router.get("/{report_id}/preview")
def preview_report(
    report_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> dict:
    report = ensure_report_access(actor, db, report_id)
    return render_report_preview(report)

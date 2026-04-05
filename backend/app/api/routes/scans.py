from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.database import SessionLocal, get_db
from backend.app.dependencies import ensure_project_access, ensure_scan_access, ensure_target_access, ensure_workspace_access, get_current_actor, require_workspace_role
from backend.app.models.entities import Finding, ScanRun
from backend.app.models.enums import MembershipRole, ScanStatus
from backend.app.schemas.scan import FindingOut, ScanCancelResponse, ScanCreate, ScanOut
from backend.app.services.billing_hooks import publish_usage_event
from backend.app.services.scan_orchestrator import create_scan_job, run_scan_pipeline

router = APIRouter(prefix="/scans", tags=["scans"])


def run_scan_background(scan_id: str) -> None:
    db = SessionLocal()
    try:
        run_scan_pipeline(db, scan_id)
    finally:
        db.close()


@router.post("", response_model=ScanOut, status_code=status.HTTP_201_CREATED)
def create_scan(
    payload: ScanCreate,
    background_tasks: BackgroundTasks,
    actor: dict = Depends(get_current_actor),
    _: dict = Depends(require_workspace_role(MembershipRole.DEVELOPER)),
    db: Session = Depends(get_db),
) -> ScanOut:
    ensure_workspace_access(actor, db, payload.workspace_id, MembershipRole.DEVELOPER)
    if payload.project_id:
        ensure_project_access(actor, db, payload.project_id, MembershipRole.DEVELOPER)
    if payload.target_site_id:
        ensure_target_access(actor, db, payload.target_site_id, MembershipRole.DEVELOPER)
    scan = create_scan_job(db, actor["user"].id, payload)
    background_tasks.add_task(run_scan_background, scan.id)
    publish_usage_event(payload.workspace_id, "scan.created", {"scan_id": scan.id, "scan_type": payload.scan_type})
    return scan


@router.get("", response_model=list[ScanOut])
def list_scans(
    project_id: str | None = None,
    actor: dict = Depends(get_current_actor),
    _: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> list[ScanOut]:
    query = select(ScanRun)
    if project_id:
        project = ensure_project_access(actor, db, project_id)
        query = query.where(ScanRun.project_id == project.id)
    elif actor.get("workspace_id"):
        ensure_workspace_access(actor, db, actor["workspace_id"])
        query = query.where(ScanRun.workspace_id == actor["workspace_id"])
    return db.scalars(query.order_by(ScanRun.created_at.desc())).all()


@router.get("/{scan_id}", response_model=ScanOut)
def get_scan(scan_id: str, actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)), db: Session = Depends(get_db)) -> ScanOut:
    return ensure_scan_access(actor, db, scan_id)


@router.post("/{scan_id}/cancel", response_model=ScanCancelResponse)
def cancel_scan(
    scan_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.DEVELOPER)),
    db: Session = Depends(get_db),
) -> ScanCancelResponse:
    scan = ensure_scan_access(actor, db, scan_id, MembershipRole.DEVELOPER)
    if scan.status == ScanStatus.COMPLETED:
        return ScanCancelResponse(status="ignored", message="Completed scans cannot be cancelled.")
    scan.status = ScanStatus.FAILED
    scan.failure_reason = "Cancelled by user"
    db.commit()
    return ScanCancelResponse(status="cancelled", message="Scan was cancelled.")


@router.get("/{scan_id}/findings", response_model=list[FindingOut])
def list_findings(
    scan_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> list[FindingOut]:
    ensure_scan_access(actor, db, scan_id)
    return db.scalars(select(Finding).where(Finding.scan_id == scan_id)).all()

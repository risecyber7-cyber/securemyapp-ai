from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.dependencies import ensure_workspace_access, get_current_actor, require_workspace_role
from backend.app.models.entities import RepositoryTarget, TargetSite, Workspace, WorkspaceMembership
from backend.app.models.enums import MembershipRole

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.get("")
def list_workspaces(actor: dict = Depends(get_current_actor), db: Session = Depends(get_db)):
    memberships = db.scalars(select(WorkspaceMembership).where(WorkspaceMembership.user_id == actor["user"].id)).all()
    workspace_ids = [membership.workspace_id for membership in memberships]
    return db.scalars(select(Workspace).where(Workspace.id.in_(workspace_ids))).all() if workspace_ids else []


@router.get("/{workspace_id}/sites")
def list_sites(
    workspace_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
):
    ensure_workspace_access(actor, db, workspace_id)
    return db.scalars(select(TargetSite).where(TargetSite.workspace_id == workspace_id)).all()


@router.get("/{workspace_id}/repositories")
def list_repositories(
    workspace_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
):
    ensure_workspace_access(actor, db, workspace_id)
    return db.scalars(select(RepositoryTarget).where(RepositoryTarget.workspace_id == workspace_id)).all()


@router.get("/{workspace_id}/scans")
def list_scans(
    workspace_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
):
    from backend.app.models.entities import ScanRun

    ensure_workspace_access(actor, db, workspace_id)
    return db.scalars(select(ScanRun).where(ScanRun.workspace_id == workspace_id).order_by(ScanRun.created_at.desc())).all()

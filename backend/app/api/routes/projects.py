from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.dependencies import ensure_project_access, ensure_workspace_access, get_current_actor, require_workspace_role
from backend.app.models.enums import MembershipRole
from backend.app.schemas.project import ProjectCreate, ProjectOut, ProjectScanGroupOut, ProjectUpdate, RepositoryTargetCreate, RepositoryTargetOut
from backend.app.services.project_service import create_project, create_repository_target, group_scans_by_project, list_projects, list_repositories

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectOut])
def list_projects_index(
    workspace_id: str | None = Query(default=None),
    actor: dict = Depends(get_current_actor),
    _: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> list[ProjectOut]:
    resolved_workspace_id = workspace_id or actor.get("workspace_id")
    if not resolved_workspace_id:
        return []
    ensure_workspace_access(actor, db, resolved_workspace_id)
    return list_projects(db, resolved_workspace_id)


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project_route(
    payload: ProjectCreate,
    actor: dict = Depends(get_current_actor),
    _: dict = Depends(require_workspace_role(MembershipRole.DEVELOPER)),
    db: Session = Depends(get_db),
) -> ProjectOut:
    ensure_workspace_access(actor, db, payload.workspace_id, MembershipRole.DEVELOPER)
    return create_project(db, actor["user"].id, payload)


@router.get("/{project_id}", response_model=ProjectOut)
def get_project_route(
    project_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> ProjectOut:
    return ensure_project_access(actor, db, project_id)


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project_route(
    project_id: str,
    payload: ProjectUpdate,
    actor: dict = Depends(get_current_actor),
    _: dict = Depends(require_workspace_role(MembershipRole.DEVELOPER)),
    db: Session = Depends(get_db),
) -> ProjectOut:
    project = ensure_project_access(actor, db, project_id, MembershipRole.DEVELOPER)
    updates = payload.model_dump(exclude_unset=True)
    if "description" in updates:
        project.description = updates.pop("description")
    for field, value in updates.items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_route(
    project_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.ADMIN)),
    db: Session = Depends(get_db),
) -> None:
    project = ensure_project_access(actor, db, project_id, MembershipRole.ADMIN)
    db.delete(project)
    db.commit()
    return None


@router.get("/workspace/{workspace_id}", response_model=list[ProjectOut])
def list_projects_route(
    workspace_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> list[ProjectOut]:
    ensure_workspace_access(actor, db, workspace_id)
    return list_projects(db, workspace_id)


@router.post("/repositories", response_model=RepositoryTargetOut, status_code=status.HTTP_201_CREATED)
def create_repository_route(
    payload: RepositoryTargetCreate,
    actor: dict = Depends(get_current_actor),
    _: dict = Depends(require_workspace_role(MembershipRole.DEVELOPER)),
    db: Session = Depends(get_db),
) -> RepositoryTargetOut:
    ensure_workspace_access(actor, db, payload.workspace_id, MembershipRole.DEVELOPER)
    if payload.project_id:
        ensure_project_access(actor, db, payload.project_id, MembershipRole.DEVELOPER)
    return create_repository_target(db, actor["user"].id, payload)


@router.get("/workspace/{workspace_id}/repositories", response_model=list[RepositoryTargetOut])
def list_repositories_route(
    workspace_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> list[RepositoryTargetOut]:
    ensure_workspace_access(actor, db, workspace_id)
    return list_repositories(db, workspace_id)


@router.get("/workspace/{workspace_id}/scan-groups", response_model=list[ProjectScanGroupOut])
def list_scan_groups_route(
    workspace_id: str,
    actor: dict = Depends(require_workspace_role(MembershipRole.VIEWER)),
    db: Session = Depends(get_db),
) -> list[ProjectScanGroupOut]:
    ensure_workspace_access(actor, db, workspace_id)
    return group_scans_by_project(db, workspace_id)

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.entities import Project, RepositoryTarget, ScanRun
from backend.app.schemas.project import ProjectCreate, RepositoryTargetCreate
from backend.app.services.audit_service import record_audit_event


def create_project(db: Session, actor_id: str, payload: ProjectCreate) -> Project:
    project = Project(
        workspace_id=payload.workspace_id,
        name=payload.name,
        description=payload.description,
    )
    db.add(project)
    db.flush()
    record_audit_event(
        db,
        action="project.created",
        entity_type="project",
        entity_id=project.id,
        actor_user_id=actor_id,
        workspace_id=payload.workspace_id,
        metadata={"name": payload.name},
    )
    db.commit()
    db.refresh(project)
    return project


def create_repository_target(db: Session, actor_id: str, payload: RepositoryTargetCreate) -> RepositoryTarget:
    repository = RepositoryTarget(
        workspace_id=payload.workspace_id,
        project_id=payload.project_id,
        provider=payload.provider,
        repository_name=payload.repository_name,
        repository_url=str(payload.repository_url) if payload.repository_url else None,
        default_branch=payload.default_branch,
        codebase_path=payload.codebase_path,
        validation_state="connected" if payload.codebase_path or payload.repository_url else "pending",
    )
    db.add(repository)
    db.flush()
    record_audit_event(
        db,
        action="repository.created",
        entity_type="repository_target",
        entity_id=repository.id,
        actor_user_id=actor_id,
        workspace_id=payload.workspace_id,
        metadata={"provider": payload.provider, "project_id": payload.project_id},
    )
    db.commit()
    db.refresh(repository)
    return repository


def list_projects(db: Session, workspace_id: str) -> list[Project]:
    return db.scalars(select(Project).where(Project.workspace_id == workspace_id)).all()


def list_repositories(db: Session, workspace_id: str) -> list[RepositoryTarget]:
    return db.scalars(select(RepositoryTarget).where(RepositoryTarget.workspace_id == workspace_id)).all()


def group_scans_by_project(db: Session, workspace_id: str) -> list[dict]:
    projects = {project.id: project for project in list_projects(db, workspace_id)}
    scans = db.scalars(select(ScanRun).where(ScanRun.workspace_id == workspace_id)).all()
    grouped: dict[str | None, dict] = {}

    for scan in scans:
        key = scan.project_id
        if key not in grouped:
            grouped[key] = {
                "project_id": key,
                "project_name": projects[key].name if key and key in projects else "Unassigned",
                "scan_count": 0,
                "scan_types": [],
            }
        grouped[key]["scan_count"] += 1
        if scan.scan_type not in grouped[key]["scan_types"]:
            grouped[key]["scan_types"].append(scan.scan_type)

    return list(grouped.values())

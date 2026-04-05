from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.security import hash_password
from backend.app.models.entities import Project, RepositoryTarget, TargetSite, User, Workspace, WorkspaceMembership
from backend.app.models.enums import MembershipRole


def seed_demo_data(db: Session) -> None:
    existing_user = db.scalar(select(User).where(User.email == "owner@securemyapp.ai"))
    if existing_user:
        return

    user = User(
        email="owner@securemyapp.ai",
        full_name="Workspace Owner",
        password_hash=hash_password("ChangeMe123!"),
        is_verified=True,
        role=MembershipRole.OWNER.value,
    )
    db.add(user)
    db.flush()

    workspace = Workspace(
        name="SecureMyApp Demo Workspace",
        owner_id=user.id,
        plan="growth",
    )
    db.add(workspace)
    db.flush()

    membership = WorkspaceMembership(
        workspace_id=workspace.id,
        user_id=user.id,
        role=MembershipRole.OWNER,
    )
    db.add(membership)
    project = Project(
        workspace_id=workspace.id,
        name="Main Web App",
        target_type="full",
        target_value="https://example.com and securemyapp-demo",
        detected_stack="nextjs, fastapi",
    )
    db.add(project)
    db.flush()

    target = TargetSite(
        workspace_id=workspace.id,
        project_id=project.id,
        base_url="https://example.com",
        verification_state="validated",
        verification_details={
            "hostname": "example.com",
            "scheme": "https",
            "is_https": True,
            "ownership_check": "demo_seed",
            "safe_for_passive_scan": True,
        },
    )
    db.add(target)
    repository = RepositoryTarget(
        workspace_id=workspace.id,
        project_id=project.id,
        provider="local",
        repository_name="securemyapp-demo",
        repository_url="https://github.com/example/securemyapp-demo",
        default_branch="main",
        codebase_path="C:\\projects\\securemyapp-demo",
        validation_state="connected",
    )
    db.add(repository)
    db.commit()

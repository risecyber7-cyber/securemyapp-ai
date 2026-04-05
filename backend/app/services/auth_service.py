from datetime import datetime
from secrets import token_urlsafe

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.security import create_access_token, hash_password, verify_password
from backend.app.models.entities import EmailVerificationToken, PasswordResetToken, User, UserSession, Workspace, WorkspaceMembership
from backend.app.models.enums import MembershipRole
from backend.app.schemas.auth import (
    ActorOut,
    AuthActionResponse,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyEmailRequest,
)
from backend.app.services.audit_service import record_audit_event


RESET_TOKEN_MESSAGE = "If the account exists, a reset flow has been started."
VERIFICATION_SENT_MESSAGE = "Verification instructions have been queued if the account exists."


def register_user(db: Session, payload: RegisterRequest) -> TokenResponse:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise ValueError("User already exists")

    user = User(email=payload.email, full_name=payload.full_name, password_hash=hash_password(payload.password))
    db.add(user)
    db.flush()

    workspace = Workspace(name=payload.workspace_name, owner_id=user.id)
    db.add(workspace)
    db.flush()

    membership = WorkspaceMembership(workspace_id=workspace.id, user_id=user.id, role=MembershipRole.OWNER)
    db.add(membership)
    db.add(EmailVerificationToken(user_id=user.id, token=token_urlsafe(24)))
    session = create_session(db, user.id, user_agent="signup-flow", ip_address="system")
    actor = ActorOut(id=user.id, email=user.email, full_name=user.full_name, workspace_id=workspace.id, role=MembershipRole.OWNER)
    record_audit_event(
        db,
        action="auth.registered",
        entity_type="user",
        entity_id=user.id,
        actor_user_id=user.id,
        workspace_id=workspace.id,
        metadata={"email": user.email},
    )
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=session.access_token, actor=actor)


def login_user(db: Session, payload: LoginRequest) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise ValueError("Invalid credentials")

    membership = db.scalar(select(WorkspaceMembership).where(WorkspaceMembership.user_id == user.id))
    actor = ActorOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        workspace_id=membership.workspace_id if membership else None,
        role=membership.role if membership else None,
    )
    session = create_session(db, user.id, user_agent="login-flow", ip_address="system")
    record_audit_event(
        db,
        action="auth.logged_in",
        entity_type="session",
        entity_id=session.id,
        actor_user_id=user.id,
        workspace_id=actor.workspace_id,
        metadata={"role": actor.role.value if actor.role else None},
    )
    db.commit()
    return TokenResponse(access_token=session.access_token, actor=actor)


def verify_email(db: Session, payload: VerifyEmailRequest) -> AuthActionResponse:
    token = db.scalar(select(EmailVerificationToken).where(EmailVerificationToken.token == payload.token))
    if not token or token.consumed_at:
        raise ValueError("Invalid verification token")
    user = db.scalar(select(User).where(User.id == token.user_id))
    token.consumed_at = datetime.utcnow()
    user.email_verified_at = datetime.utcnow()
    record_audit_event(db, "auth.email_verified", "user", user.id, user.id)
    db.commit()
    return AuthActionResponse(status="verified", message="Email verified successfully.")


def resend_verification_email(db: Session, email: str) -> AuthActionResponse:
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        return AuthActionResponse(status="accepted", message=VERIFICATION_SENT_MESSAGE)
    existing = db.scalar(
        select(EmailVerificationToken).where(
            EmailVerificationToken.user_id == user.id,
            EmailVerificationToken.consumed_at.is_(None),
        )
    )
    if existing is None:
        db.add(EmailVerificationToken(user_id=user.id, token=token_urlsafe(24)))
    record_audit_event(db, "auth.verification_queued", "user", user.id, user.id, metadata={"email": user.email})
    db.commit()
    return AuthActionResponse(status="accepted", message=VERIFICATION_SENT_MESSAGE)


def forgot_password(db: Session, payload: ForgotPasswordRequest) -> AuthActionResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        return AuthActionResponse(status="accepted", message=RESET_TOKEN_MESSAGE)
    db.add(PasswordResetToken(user_id=user.id, token=token_urlsafe(24)))
    record_audit_event(
        db,
        "auth.password_reset_requested",
        "user",
        user.id,
        user.id,
        metadata={"email": user.email},
    )
    db.commit()
    return AuthActionResponse(status="accepted", message=RESET_TOKEN_MESSAGE)


def reset_password(db: Session, payload: ResetPasswordRequest) -> AuthActionResponse:
    token = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token == payload.token))
    if not token or token.consumed_at:
        raise ValueError("Invalid reset token")
    user = db.scalar(select(User).where(User.id == token.user_id))
    user.password_hash = hash_password(payload.new_password)
    token.consumed_at = datetime.utcnow()
    revoke_user_sessions(db, user.id)
    record_audit_event(db, "auth.password_reset_completed", "user", user.id, user.id)
    db.commit()
    return AuthActionResponse(status="completed", message="Password updated successfully.")


def create_session(db: Session, user_id: str, user_agent: str | None, ip_address: str | None) -> UserSession:
    membership = db.scalar(select(WorkspaceMembership).where(WorkspaceMembership.user_id == user_id))
    access_token = create_access_token(
        user_id,
        {
            "workspace_id": membership.workspace_id if membership else None,
            "role": membership.role.value if membership else None,
        },
    )
    session = UserSession(
        user_id=user_id,
        access_token=access_token,
        user_agent=user_agent,
        ip_address=ip_address,
    )
    db.add(session)
    db.flush()
    return session


def revoke_user_sessions(db: Session, user_id: str) -> None:
    sessions = db.scalars(select(UserSession).where(UserSession.user_id == user_id, UserSession.revoked_at.is_(None))).all()
    for session in sessions:
        session.revoked_at = datetime.utcnow()


def list_active_sessions(db: Session, user_id: str) -> list[UserSession]:
    return db.scalars(select(UserSession).where(UserSession.user_id == user_id, UserSession.revoked_at.is_(None))).all()


def revoke_session(db: Session, session_id: str, actor_user_id: str) -> AuthActionResponse:
    session = db.scalar(select(UserSession).where(UserSession.id == session_id, UserSession.user_id == actor_user_id))
    if not session or session.revoked_at:
        raise ValueError("Session not found")
    session.revoked_at = datetime.utcnow()
    record_audit_event(db, "auth.session_revoked", "session", session.id, actor_user_id)
    db.commit()
    return AuthActionResponse(status="revoked", message="Session revoked.")


def list_audit_logs(db: Session, workspace_id: str | None = None) -> list:
    from backend.app.models.entities import AuditLog

    query = select(AuditLog)
    if workspace_id:
        query = query.where(AuditLog.workspace_id == workspace_id)
    return db.scalars(query.order_by(AuditLog.created_at.desc())).all()

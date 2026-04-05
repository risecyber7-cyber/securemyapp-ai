from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.dependencies import ensure_workspace_access, get_current_actor
from backend.app.models.enums import MembershipRole
from backend.app.schemas.auth import (
    AuthActionResponse,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyEmailRequest,
)
from backend.app.services.auth_service import (
    forgot_password,
    list_audit_logs,
    list_active_sessions,
    login_user,
    register_user,
    resend_verification_email,
    revoke_session,
    reset_password,
    verify_email,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        return register_user(db, payload)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        return login_user(db, payload)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error


@router.post("/verify-email", response_model=AuthActionResponse)
def verify_email_route(payload: VerifyEmailRequest, db: Session = Depends(get_db)) -> AuthActionResponse:
    try:
        return verify_email(db, payload)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error


@router.post("/resend-verification", response_model=AuthActionResponse)
def resend_verification_route(email: str = Query(...), db: Session = Depends(get_db)) -> AuthActionResponse:
    return resend_verification_email(db, email)


@router.post("/forgot-password", response_model=AuthActionResponse)
def forgot_password_route(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> AuthActionResponse:
    return forgot_password(db, payload)


@router.post("/reset-password", response_model=AuthActionResponse)
def reset_password_route(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> AuthActionResponse:
    try:
        return reset_password(db, payload)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error


@router.get("/audit-logs")
def audit_logs_route(
    workspace_id: str | None = None,
    actor: dict = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    resolved_workspace_id = workspace_id or actor.get("workspace_id")
    if resolved_workspace_id:
        ensure_workspace_access(actor, db, resolved_workspace_id, MembershipRole.ADMIN)
    return list_audit_logs(db, resolved_workspace_id)


@router.get("/sessions")
def sessions_route(actor: dict = Depends(get_current_actor), db: Session = Depends(get_db)):
    return list_active_sessions(db, actor["user"].id)


@router.post("/sessions/{session_id}/revoke", response_model=AuthActionResponse)
def revoke_session_route(session_id: str, actor: dict = Depends(get_current_actor), db: Session = Depends(get_db)) -> AuthActionResponse:
    try:
        return revoke_session(db, session_id, actor["user"].id)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error

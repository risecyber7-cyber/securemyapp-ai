from pydantic import BaseModel, EmailStr, Field

from backend.app.models.enums import MembershipRole


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    workspace_name: str = Field(min_length=2, max_length=120)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=8)
    new_password: str = Field(min_length=8, max_length=128)


class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=8)


class ActorOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    workspace_id: str | None = None
    role: MembershipRole | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    actor: ActorOut


class AuthActionResponse(BaseModel):
    status: str
    message: str
    token: str | None = None

from datetime import datetime

from pydantic import BaseModel, Field

from backend.app.models.enums import MembershipRole


class MembershipOut(BaseModel):
    user_id: str
    full_name: str
    email: str
    role: MembershipRole


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    plan: str = "starter"


class WorkspaceOut(BaseModel):
    id: str
    name: str
    plan: str
    owner_id: str
    created_at: datetime
    memberships: list[MembershipOut] = []

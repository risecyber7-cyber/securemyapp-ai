from backend.app.models.enums import MembershipRole


ROLE_ORDER = {
    MembershipRole.OWNER: 5,
    MembershipRole.ADMIN: 4,
    MembershipRole.SECURITY_ENGINEER: 3,
    MembershipRole.DEVELOPER: 2,
    MembershipRole.VIEWER: 1,
}


def role_allows(actor_role: MembershipRole, required_role: MembershipRole) -> bool:
    return ROLE_ORDER.get(actor_role, 0) >= ROLE_ORDER.get(required_role, 0)

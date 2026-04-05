from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
def get_current_user_profile() -> dict:
    return {"status": "placeholder", "message": "User profile route scaffolded in apps/api/app/routers/users.py"}

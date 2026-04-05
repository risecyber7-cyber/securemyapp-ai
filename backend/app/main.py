from fastapi import FastAPI

from backend.app.api.router import api_router
from backend.app.bootstrap import seed_demo_data
from backend.app.core.config import get_settings
from backend.app.core.database import Base, SessionLocal, engine

settings = get_settings()

app = FastAPI(title=settings.app_name)
app.include_router(api_router, prefix=settings.api_prefix)


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    if settings.seed_demo_data and settings.is_development:
        db = SessionLocal()
        try:
            seed_demo_data(db)
        finally:
            db.close()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": settings.app_name, "environment": settings.environment}

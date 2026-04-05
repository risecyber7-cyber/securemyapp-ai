from fastapi import APIRouter

from backend.app.api.routes import ai, auth, findings, fixes, issues, projects, reports, scans, settings, targets, workspaces

api_router = APIRouter()
api_router.include_router(ai.router)
api_router.include_router(auth.router)
api_router.include_router(projects.router)
api_router.include_router(workspaces.router)
api_router.include_router(targets.router)
api_router.include_router(scans.router)
api_router.include_router(findings.router)
api_router.include_router(issues.router)
api_router.include_router(fixes.router)
api_router.include_router(reports.router)
api_router.include_router(settings.router)

from backend.app.core.database import SessionLocal
from backend.app.services.scan_orchestrator import receive_queued_scan_job
from backend.app.workers.celery_app import celery_app


@celery_app.task(name="scan.run")
def run_scan_task(scan_id: str) -> str:
    db = SessionLocal()
    try:
        scan = receive_queued_scan_job(db, scan_id)
        return scan.id
    finally:
        db.close()

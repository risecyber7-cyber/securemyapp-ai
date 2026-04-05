from celery import Celery

from backend.app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "securemyapp",
    broker=settings.broker_url,
    backend=settings.result_backend,
)

celery_app.conf.task_default_queue = "scan-jobs"

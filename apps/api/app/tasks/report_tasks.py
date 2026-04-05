def enqueue_report_generation(report_id: str) -> dict:
    return {"status": "queued", "task": "report-generation", "report_id": report_id}

def enqueue_fix_generation(finding_id: str) -> dict:
    return {"status": "queued", "task": "fix-generation", "finding_id": finding_id}

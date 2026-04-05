def publish_usage_event(workspace_id: str, event_type: str, payload: dict) -> dict:
    return {
        "workspace_id": workspace_id,
        "event_type": event_type,
        "payload": payload,
        "status": "queued_for_future_billing_integration",
    }

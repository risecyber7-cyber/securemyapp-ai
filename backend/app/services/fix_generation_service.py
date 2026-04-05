from backend.app.schemas.scan import RemediationOut
from backend.app.services.ai_fix_service import generate_fix_package


def generate_exact_fix(finding_id: str, finding_context: dict, stack_context: dict | None = None) -> RemediationOut:
    payload = {
        **finding_context,
        "framework": stack_context.get("framework", finding_context.get("framework", "generic")) if stack_context else finding_context.get("framework", "generic"),
    }
    return generate_fix_package(finding_id, payload)

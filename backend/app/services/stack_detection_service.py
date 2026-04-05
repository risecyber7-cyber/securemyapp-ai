from backend.app.services.analysis.fingerprinting import fingerprint_target


def detect_stack(headers: dict | None = None, hints: list[str] | None = None) -> dict:
    headers = headers or {}
    hints = hints or []
    fingerprint = fingerprint_target(headers)

    if hints and fingerprint["framework"] == "generic":
        framework = hints[0].lower()
        fingerprint["framework"] = framework
        fingerprint["engine"] = "hint-assisted-fingerprint"

    return {
        "framework": fingerprint.get("framework", "generic"),
        "server": fingerprint.get("server"),
        "powered_by": fingerprint.get("powered_by"),
        "engine": fingerprint.get("engine", "stack-detection-service"),
        "providers": infer_providers(headers),
    }


def infer_providers(headers: dict) -> list[str]:
    server = (headers.get("server") or "").lower()
    powered_by = (headers.get("x-powered-by") or "").lower()
    providers: list[str] = []

    if "cloudflare" in server:
        providers.append("cloudflare")
    if "nginx" in server:
        providers.append("nginx")
    if "wordpress" in powered_by:
        providers.append("wordpress")
    if "react" in powered_by:
        providers.append("react")
    if "node" in powered_by or "express" in powered_by or "next" in powered_by:
        providers.append("node")

    return providers

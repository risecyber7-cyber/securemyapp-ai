def fingerprint_target(headers: dict) -> dict:
    powered_by = headers.get("x-powered-by", "")
    framework = "generic"
    if "next" in powered_by.lower():
        framework = "nextjs"
    elif "express" in powered_by.lower():
        framework = "express"

    return {
        "framework": framework,
        "server": headers.get("server"),
        "powered_by": powered_by,
        "engine": "header-based-fingerprint",
    }

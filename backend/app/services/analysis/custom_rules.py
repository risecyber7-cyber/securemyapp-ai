CUSTOM_SECURITY_RULES = [
    {
        "id": "missing-csp",
        "category": "browser-hardening",
        "severity": "medium",
        "title": "Missing Content-Security-Policy header",
    },
    {
        "id": "weak-csp",
        "category": "weak-csp",
        "severity": "medium",
        "title": "Weak Content-Security-Policy configuration",
    },
    {
        "id": "permissive-cors",
        "category": "cors-review",
        "severity": "high",
        "title": "Permissive CORS configuration detected",
    },
    {
        "id": "insecure-cookies",
        "category": "session-analysis",
        "severity": "high",
        "title": "Insecure cookie settings detected",
    },
    {
        "id": "client-side-secret",
        "category": "client-side-secrets",
        "severity": "critical",
        "title": "Potential client-side secret exposure",
    },
    {
        "id": "weak-reset-flow",
        "category": "password-reset-review",
        "severity": "medium",
        "title": "Weak password reset flow pattern detected",
    },
    {
        "id": "token-storage-risk",
        "category": "token-storage-review",
        "severity": "high",
        "title": "Token appears to be stored in localStorage",
    },
    {
        "id": "rate-limit-missing",
        "category": "rate-limit-signals",
        "severity": "medium",
        "title": "Missing rate limiting signs on public endpoints",
    },
    {
        "id": "hardcoded-secret",
        "category": "secret-management",
        "severity": "critical",
        "title": "Potential hardcoded secret in source",
    },
]

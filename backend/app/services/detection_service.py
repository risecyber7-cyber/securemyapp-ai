from backend.app.services.analysis.custom_rules import CUSTOM_SECURITY_RULES
from backend.app.services.stack_detection_service import detect_stack


def inspect_target_surface(
    base_url: str | None,
    framework_hints: list[str] | None = None,
    pasted_headers: str | None = None,
    pasted_api_responses: list[str] | None = None,
    pasted_js_bundles: list[str] | None = None,
    uploaded_code_snippets: list[str] | None = None,
) -> dict:
    parsed_headers = parse_pasted_headers(pasted_headers)
    stack = detect_stack(parsed_headers or {"x-powered-by": framework_hints[0] if framework_hints else ""}, framework_hints)
    api_responses = pasted_api_responses or []
    js_bundles = pasted_js_bundles or []
    code_snippets = uploaded_code_snippets or []

    return {
        "target": base_url,
        "headers": inspect_headers(base_url, stack, parsed_headers),
        "routes": inspect_routes(base_url, stack, api_responses),
        "js_bundle": inspect_js_bundle(base_url, stack, js_bundles, code_snippets),
        "cookies": inspect_cookies(base_url, stack, parsed_headers),
        "auth": run_auth_heuristics(base_url, stack, api_responses, code_snippets),
        "meta_tags": inspect_meta_tags(base_url, stack, js_bundles),
        "api_behavior": inspect_api_error_behavior(base_url, stack, api_responses),
        "public_endpoints": inspect_public_endpoints(base_url, stack, api_responses),
        "stack": stack,
    }


def inspect_headers(base_url: str | None, stack: dict, headers: dict) -> list[dict]:
    findings: list[dict] = []
    target_label = base_url or "supplied header set"
    header_keys = {key.lower(): value for key, value in headers.items()}

    if "content-security-policy" not in header_keys:
        findings.append(
            {
                "category": CUSTOM_SECURITY_RULES[0]["category"],
                "severity": CUSTOM_SECURITY_RULES[0]["severity"],
                "title": CUSTOM_SECURITY_RULES[0]["title"],
                "description": f"Passive header analysis found a missing CSP candidate for {target_label}.",
                "framework": stack["framework"],
            }
        )
    elif "'unsafe-inline'" in header_keys.get("content-security-policy", "").lower():
        findings.append(
            {
                "category": "weak-csp",
                "severity": "medium",
                "title": "Weak Content-Security-Policy configuration",
                "description": f"CSP for {target_label} appears to allow unsafe inline script execution.",
                "framework": stack["framework"],
            }
        )

    if "x-ratelimit-limit" not in header_keys and "ratelimit-limit" not in header_keys:
        findings.append(
            {
                "category": "rate-limit-signals",
                "severity": "medium",
                "title": "Missing rate limiting signs on public endpoints",
                "description": f"No obvious rate-limit response headers were observed for {target_label}.",
                "framework": stack["framework"],
            }
        )

    return dedupe_findings(findings)


def inspect_routes(base_url: str | None, stack: dict, api_responses: list[str]) -> list[dict]:
    target_label = base_url or "supplied API responses"
    findings = [
        {
            "category": "api-route-review",
            "severity": "medium",
            "title": "API route review recommended",
            "description": f"Route inspection heuristics recommend review of auth and mutation endpoints for {target_label}.",
            "framework": stack["framework"],
        }
    ] if base_url or api_responses else []

    for response in api_responses:
        lowered = response.lower()
        if '"access-control-allow-origin":"*"' in lowered or "access-control-allow-origin: *" in lowered:
            findings.append(
                {
                    "category": "cors-review",
                    "severity": "high",
                    "title": "Permissive CORS configuration detected",
                    "description": f"Supplied API response for {target_label} appears to allow wildcard CORS access.",
                    "framework": stack["framework"],
                }
            )
        if "stack trace" in lowered or "traceback" in lowered or '"error":"' in lowered:
            findings.append(
                {
                    "category": "api-error-behavior",
                    "severity": "low",
                    "title": "Verbose API error behavior observed",
                    "description": f"API error content for {target_label} may expose internal behavior or debugging context.",
                    "framework": stack["framework"],
                }
            )

    return dedupe_findings(findings)


def inspect_js_bundle(base_url: str | None, stack: dict, js_bundles: list[str], code_snippets: list[str]) -> list[dict]:
    findings: list[dict] = []
    materials = [*js_bundles, *code_snippets]
    target_label = base_url or "supplied frontend bundle"

    if base_url or materials:
        findings.append(
            {
                "category": "js-bundle-inspection",
                "severity": "medium",
                "title": "Frontend bundle exposes runtime config hints",
                "description": f"Bundle inspection suggests public runtime config values should be reviewed for {target_label}.",
                "framework": stack["framework"],
            }
        )

    for material in materials:
        lowered = material.lower()
        if "localstorage.setitem(" in lowered and ("token" in lowered or "jwt" in lowered or "auth" in lowered):
            findings.append(
                {
                    "category": "token-storage-review",
                    "severity": "high",
                    "title": "Token appears to be stored in localStorage",
                    "description": f"Client-side code for {target_label} appears to store auth-sensitive values in localStorage.",
                    "framework": stack["framework"],
                }
            )
        if "authorization" in lowered and "fetch(" in lowered and ("bearer" in lowered or "token" in lowered):
            findings.append(
                {
                    "category": "unsafe-fetch-patterns",
                    "severity": "medium",
                    "title": "Unsafe frontend fetch pattern review recommended",
                    "description": f"Frontend fetch logic for {target_label} may be handling auth headers in an unsafe client-visible pattern.",
                    "framework": stack["framework"],
                }
            )
        if "api_key" in lowered or "sk_live_" in lowered or "secret_key" in lowered:
            findings.append(
                {
                    "category": "client-side-secrets",
                    "severity": "critical",
                    "title": "Potential client-side secret exposure",
                    "description": f"Bundle or snippet material for {target_label} appears to expose secret-like values.",
                    "framework": stack["framework"],
                }
            )
        if "next_public_" in lowered or "publicconfig" in lowered:
            findings.append(
                {
                    "category": "config-exposure",
                    "severity": "medium",
                    "title": "Potential exposed API keys or public config values",
                    "description": f"Client material for {target_label} includes public config values that should be reviewed for sensitivity.",
                    "framework": stack["framework"],
                }
            )

    return dedupe_findings(findings)


def inspect_cookies(base_url: str | None, stack: dict, headers: dict) -> list[dict]:
    findings: list[dict] = []
    target_label = base_url or "supplied cookie headers"
    cookie_header = " ".join([value for key, value in headers.items() if key.lower() == "set-cookie"]).lower()

    if base_url or cookie_header:
        findings.append(
            {
                "category": "session-analysis",
                "severity": "medium",
                "title": "Cookie and session settings should be hardened",
                "description": f"Cookie inspection suggests Secure, HttpOnly, and SameSite settings should be reviewed for {target_label}.",
                "framework": stack["framework"],
            }
        )
    if cookie_header and ("secure" not in cookie_header or "httponly" not in cookie_header or "samesite" not in cookie_header):
        findings.append(
            {
                "category": "session-analysis",
                "severity": "high",
                "title": "Insecure cookie settings detected",
                "description": f"Observed cookies for {target_label} may be missing Secure, HttpOnly, or SameSite protections.",
                "framework": stack["framework"],
            }
        )

    return dedupe_findings(findings)


def run_auth_heuristics(base_url: str | None, stack: dict, api_responses: list[str], code_snippets: list[str]) -> list[dict]:
    findings: list[dict] = []
    target_label = base_url or "supplied auth flow artifacts"
    materials = [*api_responses, *code_snippets]

    if base_url or materials:
        findings.append(
            {
                "category": "auth-flow-review",
                "severity": "low",
                "title": "Authentication flow review recommended",
                "description": f"Safe auth heuristics recommend login, logout, and reset-flow review for {target_label}.",
                "framework": stack["framework"],
            }
        )

    for material in materials:
        lowered = material.lower()
        if "reset" in lowered and ("token" in lowered or "password" in lowered):
            findings.append(
                {
                    "category": "password-reset-review",
                    "severity": "medium",
                    "title": "Weak password reset flow pattern detected",
                    "description": f"Password reset handling for {target_label} should be reviewed for token leakage, enumeration, and single-use guarantees.",
                    "framework": stack["framework"],
                }
            )
        if "bearer " in lowered or "access_token" in lowered or "refresh_token" in lowered:
            findings.append(
                {
                    "category": "auth-token-handling",
                    "severity": "medium",
                    "title": "Auth token handling review recommended",
                    "description": f"Observed auth materials for {target_label} suggest token lifecycle and client exposure should be reviewed.",
                    "framework": stack["framework"],
                }
            )

    return dedupe_findings(findings)


def inspect_meta_tags(base_url: str | None, stack: dict, js_bundles: list[str]) -> list[dict]:
    for bundle in js_bundles:
        lowered = bundle.lower()
        if 'meta name="api-key"' in lowered or "meta name='api-key'" in lowered:
            return [
                {
                    "category": "config-exposure",
                    "severity": "medium",
                    "title": "Meta tag exposes config or key-like material",
                    "description": f"Public markup or bundle content for {base_url or 'supplied material'} includes a meta tag that should be reviewed for sensitive config leakage.",
                    "framework": stack["framework"],
                }
            ]
    return []


def inspect_api_error_behavior(base_url: str | None, stack: dict, api_responses: list[str]) -> list[dict]:
    findings: list[dict] = []
    for response in api_responses:
        lowered = response.lower()
        if "429" not in lowered and ("/login" in lowered or "/auth" in lowered or "/password-reset" in lowered):
            findings.append(
                {
                    "category": "rate-limit-signals",
                    "severity": "medium",
                    "title": "Missing rate limiting signs",
                    "description": f"Observed API behavior for {base_url or 'supplied responses'} does not show clear rate-limit responses on auth-facing endpoints.",
                    "framework": stack["framework"],
                }
            )
    return dedupe_findings(findings)


def inspect_public_endpoints(base_url: str | None, stack: dict, api_responses: list[str]) -> list[dict]:
    if not api_responses:
        return []
    return [
        {
            "category": "public-endpoint-review",
            "severity": "low",
            "title": "Public endpoint surface should be reviewed",
            "description": f"Supplied API responses for {base_url or 'the target'} indicate a public endpoint surface worth validating for auth and data exposure controls.",
            "framework": stack["framework"],
        }
    ]


def parse_pasted_headers(pasted_headers: str | None) -> dict:
    if not pasted_headers:
        return {}
    parsed: dict[str, str] = {}
    for line in pasted_headers.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        parsed[key.strip()] = value.strip()
    return parsed


def dedupe_findings(findings: list[dict]) -> list[dict]:
    seen: set[tuple[str, str]] = set()
    deduped: list[dict] = []
    for finding in findings:
        key = (finding["category"], finding["title"])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(finding)
    return deduped

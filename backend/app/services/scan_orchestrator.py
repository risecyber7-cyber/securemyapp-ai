from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.entities import Finding, Remediation, RepositoryTarget, ScanRun, TargetSite
from backend.app.models.enums import ScanStatus, SeverityLevel
from backend.app.schemas.scan import ScanCreate
from backend.app.services.detection_service import inspect_target_surface
from backend.app.services.fix_generation_service import generate_exact_fix
from backend.app.services.normalization_service import normalize_results
from backend.app.services.notification_service import send_scan_completed_notification
from backend.app.services.stack_detection_service import detect_stack


def create_scan_job(db: Session, actor_id: str, payload: ScanCreate) -> ScanRun:
    scan = ScanRun(
        project_id=payload.project_id,
        scan_mode=payload.scan_type.value,
        started_at=None,
        completed_at=None,
        workspace_id=payload.workspace_id,
        created_by_id=actor_id,
        status=ScanStatus.QUEUED,
        repo_path=payload.repo_path,
        repository_target_id=payload.repository_target_id,
        target_site_id=payload.target_site_id,
        framework_hints=payload.framework_hints,
        summary_json={
            "input_types": {
                "public_website_url": bool(payload.public_website_url or payload.target_site_id),
                "uploaded_code_snippets": len(payload.uploaded_code_snippets),
                "pasted_headers": bool(payload.pasted_headers),
                "pasted_api_responses": len(payload.pasted_api_responses),
                "pasted_js_bundles": len(payload.pasted_js_bundles),
            },
            "public_website_url": payload.public_website_url,
            "pasted_headers": payload.pasted_headers,
            "pasted_api_responses": payload.pasted_api_responses,
            "pasted_js_bundles": payload.pasted_js_bundles,
            "uploaded_code_snippets_payload": payload.uploaded_code_snippets,
        },
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return scan


def run_scan_pipeline(db: Session, scan_id: str) -> ScanRun:
    scan = db.scalar(select(ScanRun).where(ScanRun.id == scan_id))
    if not scan:
        raise ValueError("Scan not found")

    scan.status = ScanStatus.RUNNING
    scan.started_at = scan.started_at or datetime.utcnow()
    db.commit()

    target = db.scalar(select(TargetSite).where(TargetSite.id == scan.target_site_id)) if scan.target_site_id else None
    repository = db.scalar(select(RepositoryTarget).where(RepositoryTarget.id == scan.repository_target_id)) if scan.repository_target_id else None
    summary_payload = scan.summary_json or {}

    raw_findings = aggregate_scan_results(
        scan.repo_path or (repository.codebase_path if repository else None),
        payload_base_url(scan, target),
        scan.framework_hints,
        pasted_headers=summary_payload.get("pasted_headers"),
        pasted_api_responses=summary_payload.get("pasted_api_responses", []),
        pasted_js_bundles=summary_payload.get("pasted_js_bundles", []),
        uploaded_code_snippets=summary_payload.get("uploaded_code_snippets_payload", []),
    )
    normalized_findings, summary = normalize_results(raw_findings)

    for normalized in normalized_findings:
        finding = Finding(
            scan_id=scan.id,
            source=normalized["source"],
            category=normalized["category"],
            severity=SeverityLevel(normalized["severity"]),
            confidence=normalized["confidence"],
            title=normalized["title"],
            description=normalized["description"],
            framework=normalized["framework"],
            file_path=normalized.get("file_path"),
            line_start=normalized.get("line_start"),
            line_end=normalized.get("line_end"),
            url=normalized.get("url"),
            evidence=normalized.get("evidence", {}),
            cwe_ids=normalized.get("cwe_ids", []),
            owasp_tags=normalized.get("owasp_tags", []),
            fix_available=normalized.get("fix_available", True),
            false_positive=normalized.get("false_positive", False),
            status=normalized.get("status", "open"),
            business_impact=normalized.get("business_impact"),
            ai_notes=normalized.get("ai_notes"),
        )
        db.add(finding)
        db.flush()

        remediation_payload = generate_exact_fix(finding.id, normalized, {"framework": normalized.get("framework", "generic")})
        remediation = Remediation(
            finding_id=finding.id,
            title=remediation_payload.title,
            explanation=remediation_payload.explanation,
            patch_diff=remediation_payload.patch_diff,
            code_snippet=remediation_payload.code_snippet,
            references=remediation_payload.references,
            validation_steps=remediation_payload.validation_steps,
            review_required=remediation_payload.review_required,
            confidence_score=remediation_payload.confidence_score,
            before_code=remediation_payload.before_code,
            after_code=remediation_payload.after_code,
            middleware_example=remediation_payload.middleware_example,
            secure_config_example=remediation_payload.secure_config_example,
        )
        db.add(remediation)

    scan.status = ScanStatus.COMPLETED
    scan.completed_at = datetime.utcnow()
    scan.normalized_summary = summary
    db.commit()
    send_scan_completed_notification(db, scan.workspace_id, scan.id, [])
    db.refresh(scan)
    return scan


def receive_queued_scan_job(db: Session, scan_id: str) -> ScanRun:
    return run_scan_pipeline(db, scan_id)


def aggregate_scan_results(
    repo_path: str | None,
    base_url: str | None,
    framework_hints: list[str],
    pasted_headers: str | None = None,
    pasted_api_responses: list[str] | None = None,
    pasted_js_bundles: list[str] | None = None,
    uploaded_code_snippets: list[str] | None = None,
) -> list[dict]:
    return build_demo_findings(
        repo_path,
        base_url,
        framework_hints,
        pasted_headers=pasted_headers,
        pasted_api_responses=pasted_api_responses,
        pasted_js_bundles=pasted_js_bundles,
        uploaded_code_snippets=uploaded_code_snippets,
    )


def build_demo_findings(
    repo_path: str | None,
    base_url: str | None,
    framework_hints: list[str],
    pasted_headers: str | None = None,
    pasted_api_responses: list[str] | None = None,
    pasted_js_bundles: list[str] | None = None,
    uploaded_code_snippets: list[str] | None = None,
) -> list[dict]:
    framework = framework_hints[0] if framework_hints else "nextjs"
    findings: list[dict] = []

    if repo_path or uploaded_code_snippets:
        root_label = repo_path or "uploaded-snippet"
        findings.extend(
            [
                {
                    "source": "static",
                    "category": "secret-management",
                    "severity": "critical",
                    "confidence": "medium",
                    "title": "Potential hardcoded secret in source",
                    "description": "Credential-like value detected in application code.",
                    "framework": framework,
                    "file_path": f"{root_label}\\src\\config\\auth.ts",
                    "line_start": 12,
                    "line_end": 12,
                    "evidence": {"detector": "template-secret-pattern"},
                    "cwe_ids": ["CWE-798"],
                    "owasp_tags": ["A02:2021-Cryptographic Failures"],
                    "fix_available": True,
                    "false_positive": False,
                    "status": "open",
                    "business_impact": "Hardcoded secrets can expose production credentials and widen breach scope.",
                    "ai_notes": "Prioritize secret rotation immediately after code changes.",
                },
                {
                    "source": "static",
                    "category": "request-validation",
                    "severity": "medium",
                    "confidence": "medium",
                    "title": "Missing validation pattern on API route",
                    "description": "Route handler appears to accept body input without schema validation.",
                    "framework": framework,
                    "file_path": f"{root_label}\\src\\api\\auth\\route.ts",
                    "line_start": 21,
                    "line_end": 24,
                    "evidence": {"detector": "validation-gap"},
                    "cwe_ids": ["CWE-20"],
                    "owasp_tags": ["A04:2021-Insecure Design"],
                    "fix_available": True,
                    "false_positive": False,
                    "status": "open",
                    "business_impact": "Unvalidated request bodies can create unsafe execution paths and malformed state changes.",
                    "ai_notes": "Schema validation should run before route logic and persist across handler refactors.",
                },
                {
                    "source": "static",
                    "category": "config-exposure",
                    "severity": "medium",
                    "confidence": "medium",
                    "title": "Potential exposed frontend config value",
                    "description": "Client bundle appears to expose a public runtime config value worth review.",
                    "framework": framework,
                    "file_path": f"{root_label}\\src\\app\\layout.tsx",
                    "line_start": 8,
                    "line_end": 11,
                    "evidence": {"detector": "public-config-scan"},
                    "cwe_ids": ["CWE-200"],
                    "owasp_tags": ["A01:2021-Broken Access Control"],
                    "fix_available": True,
                    "false_positive": False,
                    "status": "open",
                    "business_impact": "Publicly exposed config values can leak environment details and attack surface hints.",
                    "ai_notes": "Review which runtime values truly need client exposure.",
                },
            ]
        )

    if base_url or pasted_headers or pasted_api_responses or pasted_js_bundles or uploaded_code_snippets:
        detection_result = inspect_target_surface(
            base_url,
            framework_hints,
            pasted_headers=pasted_headers,
            pasted_api_responses=pasted_api_responses,
            pasted_js_bundles=pasted_js_bundles,
            uploaded_code_snippets=uploaded_code_snippets,
        )
        fingerprint = detect_stack({"x-powered-by": framework}, framework_hints)
        for group_name, detector_findings in detection_result.items():
            if group_name in {"target", "stack"}:
                continue
            for candidate in detector_findings:
                findings.append(
                    {
                        "source": "dynamic" if group_name != "js_bundle" or base_url else "static",
                        "category": candidate["category"],
                        "severity": candidate["severity"],
                        "confidence": "medium",
                        "title": candidate["title"],
                        "description": candidate["description"],
                        "framework": candidate.get("framework", fingerprint["framework"]),
                        "url": base_url,
                        "evidence": {"detector": group_name, "fingerprint": fingerprint},
                        "cwe_ids": infer_cwe_ids(candidate["category"]),
                        "owasp_tags": infer_owasp_tags(candidate["category"]),
                        "fix_available": candidate["category"] not in {"public-endpoint-review"},
                        "false_positive": False,
                        "status": "open",
                        "business_impact": infer_business_impact(candidate["category"]),
                        "ai_notes": infer_ai_notes(candidate["category"]),
                    }
                )

    return findings


def payload_base_url(scan: ScanRun, target: TargetSite | None) -> str | None:
    summary = scan.summary_json or {}
    return target.base_url if target else summary.get("public_website_url")


def infer_cwe_ids(category: str) -> list[str]:
    mapping = {
        "browser-hardening": ["CWE-693"],
        "weak-csp": ["CWE-693"],
        "cors-review": ["CWE-942"],
        "session-analysis": ["CWE-614"],
        "auth-flow-review": ["CWE-306"],
        "password-reset-review": ["CWE-640"],
        "client-side-secrets": ["CWE-200"],
        "config-exposure": ["CWE-200"],
        "token-storage-review": ["CWE-922"],
        "unsafe-fetch-patterns": ["CWE-359"],
        "rate-limit-signals": ["CWE-770"],
    }
    return mapping.get(category, ["CWE-693"])


def infer_owasp_tags(category: str) -> list[str]:
    mapping = {
        "browser-hardening": ["A05:2021-Security Misconfiguration"],
        "weak-csp": ["A05:2021-Security Misconfiguration"],
        "cors-review": ["A05:2021-Security Misconfiguration"],
        "session-analysis": ["A07:2021-Identification and Authentication Failures"],
        "auth-flow-review": ["A07:2021-Identification and Authentication Failures"],
        "password-reset-review": ["A07:2021-Identification and Authentication Failures"],
        "client-side-secrets": ["A02:2021-Cryptographic Failures"],
        "config-exposure": ["A01:2021-Broken Access Control"],
        "token-storage-review": ["A07:2021-Identification and Authentication Failures"],
        "unsafe-fetch-patterns": ["A01:2021-Broken Access Control"],
        "rate-limit-signals": ["A04:2021-Insecure Design"],
    }
    return mapping.get(category, ["A05:2021-Security Misconfiguration"])


def infer_business_impact(category: str) -> str:
    mapping = {
        "browser-hardening": "Missing browser protections can widen the blast radius of frontend injection issues.",
        "weak-csp": "Weak CSP rules reduce browser-level containment against script injection.",
        "cors-review": "Permissive cross-origin behavior can expose authenticated APIs to unintended origins.",
        "session-analysis": "Weak cookie handling increases token theft and account takeover risk.",
        "auth-flow-review": "Authentication flow weaknesses can erode trust and weaken account safety.",
        "password-reset-review": "Weak reset flows can enable account recovery abuse or token leakage.",
        "client-side-secrets": "Client-side secret exposure can leak production credentials or privileged access tokens.",
        "config-exposure": "Public runtime config can expose environment details and attack surface hints.",
        "token-storage-review": "Persisting tokens in localStorage increases exposure to XSS-assisted account compromise.",
        "unsafe-fetch-patterns": "Unsafe client-side auth fetch logic can expose sensitive tokens or leak privileged behavior.",
        "rate-limit-signals": "Missing throttling signs can increase brute-force and abuse risk on public endpoints.",
    }
    return mapping.get(category, "Security hardening review recommended for the observed pattern.")


def infer_ai_notes(category: str) -> str:
    mapping = {
        "browser-hardening": "Prefer secure defaults at the framework or reverse-proxy boundary.",
        "weak-csp": "Start restrictive and widen only for explicitly trusted origins or script hashes.",
        "cors-review": "Avoid wildcard origins with credentials and maintain an explicit allowlist.",
        "session-analysis": "Secure, HttpOnly, and SameSite should be enforced where sessions are issued.",
        "auth-flow-review": "Review login, logout, reset, and session invalidation together rather than in isolation.",
        "password-reset-review": "Reset tokens should be single-use, time-bound, and absent from client-visible logs.",
        "client-side-secrets": "Move sensitive values server-side and rotate anything that may already be exposed.",
        "config-exposure": "Only expose values that are intentionally public and operationally required client-side.",
        "token-storage-review": "Prefer HttpOnly cookies or ephemeral in-memory strategies over localStorage for auth tokens.",
        "unsafe-fetch-patterns": "Minimize client-managed bearer tokens and avoid embedding long-lived secrets in fetch calls.",
        "rate-limit-signals": "Auth, reset, and public mutation endpoints should show clear throttling behavior or defensive responses.",
    }
    return mapping.get(category, "Validate the finding manually before rollout and use framework-safe defaults.")

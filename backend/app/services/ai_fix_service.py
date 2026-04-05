from dataclasses import dataclass
from typing import Any

from backend.app.schemas.scan import RemediationOut, SafeExplanation
from backend.app.services.openrouter_service import OpenRouterService
from backend.app.utils.prompt_builder import build_fix_messages


@dataclass
class NormalizedIssue:
    issue_type: str
    category: str
    severity: str
    framework: str
    runtime: str
    location: str
    evidence: dict[str, Any]


@dataclass
class EnrichedContext:
    issue: NormalizedIssue
    detected_framework: str
    hosting_pattern: str
    auth_method: str
    deployment_layer: str


@dataclass
class RemediationStrategy:
    context: EnrichedContext
    fix_type: str
    auto_fixable: bool


class AIFixPipeline:
    def __init__(self, finding_id: str, raw_finding_dict: dict):
        self.finding_id = finding_id
        self.raw = raw_finding_dict
        self.openrouter = OpenRouterService()

    def step1_normalize_issue(self) -> NormalizedIssue:
        framework = self.raw.get("framework", "unknown")
        runtime = "node" if framework in ["nextjs", "express", "react", "nestjs"] else framework
        return NormalizedIssue(
            issue_type=self.raw.get("title", "unknown_issue").lower().replace(" ", "_"),
            category=self.raw.get("category", "generic"),
            severity=self.raw.get("severity", "medium"),
            framework=framework,
            runtime=runtime,
            location=self.raw.get("file_path") or self.raw.get("location") or "unknown_location",
            evidence=self.raw.get("evidence") or self.raw.get("evidence_json") or {},
        )

    def step2_enrich_context(self, issue: NormalizedIssue) -> EnrichedContext:
        framework = issue.framework if issue.framework != "unknown" else "nextjs"
        location = str(issue.location).lower()
        hosting = "vercel" if framework == "nextjs" else "docker"
        auth = "next-auth" if "auth" in location else "jwt"
        layer = "edge/middleware" if "middleware" in location else "server"
        return EnrichedContext(
            issue=issue,
            detected_framework=framework,
            hosting_pattern=hosting,
            auth_method=auth,
            deployment_layer=layer,
        )

    def step3_map_remediation(self, context: EnrichedContext) -> RemediationStrategy:
        category = context.issue.category.lower()
        title = context.issue.issue_type.lower()
        if "csp" in title or category in {"security_headers", "missing_csp", "weak-csp"}:
            return RemediationStrategy(context=context, fix_type="config", auto_fixable=True)
        if category in {"secret-management", "client-side-secrets", "request-validation"}:
            return RemediationStrategy(context=context, fix_type="code", auto_fixable=True)
        return RemediationStrategy(context=context, fix_type="hybrid", auto_fixable=False)

    def step4_generate_llm_fix(self, strategy: RemediationStrategy) -> dict:
        system_prompt, user_prompt = build_fix_messages(self.raw)
        llm_response = self.openrouter.generate_json(system_prompt, user_prompt)
        if llm_response:
            return llm_response
        return self._fallback_fix(strategy)

    def _fallback_fix(self, strategy: RemediationStrategy) -> dict:
        category = strategy.context.issue.category.lower()
        if category in {"security_headers", "weak-csp", "missing_csp"} or "csp" in strategy.context.issue.issue_type:
            return {
                "explanation": {
                    "title": "Missing Content Security Policy (CSP)",
                    "summary": "The application is missing a restrictive Content Security Policy header.",
                    "technical_explanation": "Without a CSP, injected scripts have fewer browser-enforced restrictions.",
                    "why_it_matters": "A missing CSP increases the impact of XSS and unsafe third-party script execution.",
                    "likely_causes": "Headers were never configured at the framework or proxy layer.",
                    "safe_business_impact": "This weakens browser-side containment and increases user-session risk.",
                    "remediation_overview": "Set framework-level CSP headers and test allowed sources in staging.",
                },
                "exact_patch": {
                    "before": "export default nextConfig;",
                    "after": "const csp = \"default-src 'self'; object-src 'none'; base-uri 'self';\";\n\nconst nextConfig = {\n  async headers() {\n    return [{ source: '/:path*', headers: [{ key: 'Content-Security-Policy', value: csp }] }];\n  },\n};\n\nexport default nextConfig;",
                    "snippet": "const csp = \"default-src 'self'; object-src 'none'; base-uri 'self';\";",
                    "config": "Content-Security-Policy: default-src 'self'; object-src 'none'; base-uri 'self';",
                    "middleware": "",
                },
                "implementation_steps": [
                    "Add the CSP header at the framework or proxy boundary.",
                    "Review any external scripts, fonts, or APIs that require explicit allowlists.",
                    "Deploy to staging and fix any blocked legitimate resources.",
                ],
                "validation_checklist": [
                    "Confirm the main HTML response includes the CSP header.",
                    "Verify the browser console does not show unexpected CSP violations.",
                    "Re-run the security scan after deployment.",
                ],
            }

        return {
            "explanation": {
                "title": f"Secure remediation for {strategy.context.issue.category}",
                "summary": "SecureMyApp AI generated a defensive remediation package for this finding.",
                "technical_explanation": f"The issue appears in the {strategy.context.deployment_layer} layer for {strategy.context.detected_framework}.",
                "why_it_matters": "Unreviewed security gaps can expose authentication, configuration, or request-processing boundaries.",
                "likely_causes": "The code path lacks centralized validation or hardened framework defaults.",
                "safe_business_impact": "The issue can increase operational risk and weaken trust in production behavior.",
                "remediation_overview": "Apply the code change, add tests, and validate in staging before release.",
            },
            "exact_patch": {
                "before": "// insecure implementation",
                "after": "// secure implementation with validation and safer defaults",
                "snippet": "// apply framework-safe validation and secret handling here",
                "config": "",
                "middleware": "",
            },
            "implementation_steps": [
                "Add validation or secure configuration at the shared boundary.",
                "Update the affected handler or config file.",
                "Add regression coverage for the risky behavior.",
            ],
            "validation_checklist": [
                "Confirm the vulnerable path no longer reproduces.",
                "Run the relevant tests and re-run the scan.",
                "Verify no legitimate user flow regressed.",
            ],
        }

    def step5_calculate_confidence(self, strategy: RemediationStrategy, llm_fix: dict) -> int:
        base = 55
        stack_certainty = 20 if strategy.context.detected_framework != "unknown" else 5
        patch_specificity = 15 if llm_fix.get("exact_patch", {}).get("after") else 5
        issue_confidence = 10 if strategy.context.issue.severity in ["critical", "high", "medium"] else 5
        return min(base + stack_certainty + patch_specificity + issue_confidence, 99)

    def execute(self) -> RemediationOut:
        issue = self.step1_normalize_issue()
        context = self.step2_enrich_context(issue)
        strategy = self.step3_map_remediation(context)
        llm_fix = self.step4_generate_llm_fix(strategy)
        confidence = self.step5_calculate_confidence(strategy, llm_fix)
        explanation_data = llm_fix["explanation"]
        exact_patch = llm_fix["exact_patch"]
        structured_explanation = SafeExplanation(
            title=explanation_data["title"],
            summary=explanation_data["summary"],
            technical_explanation=explanation_data["technical_explanation"],
            why_it_matters=explanation_data["why_it_matters"],
            likely_causes=explanation_data["likely_causes"],
            safe_business_impact=explanation_data["safe_business_impact"],
            remediation_overview=explanation_data["remediation_overview"],
        )
        return RemediationOut(
            id=f"rem_{self.finding_id}",
            finding_id=self.finding_id,
            title=explanation_data["title"],
            explanation=explanation_data["remediation_overview"],
            patch_diff=None,
            code_snippet=exact_patch.get("snippet") or "// remediation not available",
            references=self.raw.get("cwe_ids", []) + self.raw.get("owasp_tags", []),
            validation_steps=llm_fix.get("validation_checklist", []),
            review_required=True,
            confidence_score=confidence,
            before_code=exact_patch.get("before"),
            after_code=exact_patch.get("after"),
            middleware_example=exact_patch.get("middleware"),
            secure_config_example=exact_patch.get("config"),
            structured_explanation=structured_explanation,
        )


def generate_fix_package(finding_id: str, finding: dict) -> RemediationOut:
    return AIFixPipeline(finding_id, finding).execute()

from backend.app.models.enums import ReportAudience


def build_report_summary(findings: list[dict], audience: ReportAudience) -> dict:
    counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    for finding in findings:
        counts[finding["severity"]] = counts.get(finding["severity"], 0) + 1

    if audience == ReportAudience.STAKEHOLDER:
        risk = "critical" if counts["critical"] else "high" if counts["high"] else "medium" if counts["medium"] else "low"
        return {
            "headline": f"Security review completed with {sum(counts.values())} findings.",
            "risk_level": risk,
            "recommendation": "Prioritize critical and high-severity items before the next production release.",
            "counts": counts,
        }

    return {
        "headline": "Developer remediation report",
        "counts": counts,
        "next_steps": [
            "Validate each remediation before merge.",
            "Add regression coverage.",
            "Re-run scans after changes deploy.",
        ],
    }


def build_remediation_plan(findings: list[dict]) -> dict:
    critical = [finding for finding in findings if finding["severity"] in {"critical", "high"}]
    backlog = [finding for finding in findings if finding["severity"] in {"medium", "low", "info"}]
    return {
        "immediate_actions": [
            f"Resolve {finding['title']}" for finding in critical[:5]
        ],
        "scheduled_actions": [
            f"Plan remediation for {finding['title']}" for finding in backlog[:5]
        ],
        "developer_report_sections": [
            "issue summary",
            "severity matrix",
            "framework-specific remediation",
            "verification steps",
        ],
        "client_pdf_sections": [
            "executive summary",
            "risk overview",
            "remediation plan",
            "appendix of findings",
        ],
    }

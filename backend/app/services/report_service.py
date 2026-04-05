from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.entities import Finding, Report, ScanRun
from backend.app.schemas.report import ReportCreate
from backend.app.services.report_builder import build_remediation_plan, build_report_summary
from backend.app.services.storage import build_report_storage_key


def create_report_artifact(db: Session, payload: ReportCreate) -> Report:
    scan = db.scalar(select(ScanRun).where(ScanRun.id == payload.scan_id))
    if not scan:
        raise ValueError("Scan not found")
    findings = db.scalars(select(Finding).where(Finding.scan_id == payload.scan_id)).all()
    if not findings:
        raise ValueError("No findings found for scan")

    summary = build_report_summary(
        [{"severity": finding.severity.value, "source": finding.source} for finding in findings],
        payload.audience,
    )
    report = Report(
        project_id=scan.project_id,
        scan_id=payload.scan_id,
        audience=payload.audience,
        format=payload.format,
        summary=summary,
        remediation_plan=build_remediation_plan(
            [{"title": finding.title, "severity": finding.severity.value} for finding in findings]
        ),
        artifact_url=build_report_storage_key(payload.scan_id, f"draft-{payload.audience}", payload.format),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def render_report_preview(report: Report) -> dict:
    return {
        "id": report.id,
        "format": report.format,
        "markdown": f"# {report.summary.get('headline', 'Security Report')}\n\nGenerated report preview.",
        "html": f"<h1>{report.summary.get('headline', 'Security Report')}</h1><p>Generated report preview.</p>",
        "pdf_status": "placeholder",
    }

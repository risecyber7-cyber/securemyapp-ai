import { createId, getOne, insert, listWhere } from "../store/db.js";

export function createReport(input) {
  if (!input.scanId) {
    const error = new Error("scanId is required");
    error.statusCode = 400;
    throw error;
  }

  const scan = getOne("scans", input.scanId, "Scan");
  const findings = listWhere("findings", (finding) => finding.scanId === scan.id);
  const audience = input.audience || "developer";
  const format = input.format || "json";

  const summary = buildSummary(findings, audience);

  return insert("reports", {
    id: createId("report"),
    scanId: scan.id,
    audience,
    format,
    summary,
    findings,
    createdAt: new Date().toISOString(),
  });
}

export function getReport(id) {
  return getOne("reports", id, "Report");
}

function buildSummary(findings, audience) {
  const counts = findings.reduce(
    (accumulator, finding) => {
      accumulator.total += 1;
      accumulator[finding.severity] += 1;
      return accumulator;
    },
    { total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 },
  );

  if (audience === "stakeholder") {
    return {
      headline: `Scan completed with ${counts.total} findings.`,
      riskLevel:
        counts.critical > 0 ? "critical" : counts.high > 0 ? "high" : counts.medium > 0 ? "medium" : "low",
      recommendation:
        counts.critical > 0 || counts.high > 0
          ? "Prioritize high-severity remediation before the next release."
          : "No urgent blockers found, but remediation should be scheduled.",
      counts,
    };
  }

  return {
    headline: "Developer remediation report",
    counts,
    nextSteps: [
      "Review each generated remediation before applying it.",
      "Add regression tests around the affected code paths.",
      "Re-run the scan after fixes land.",
    ],
  };
}

from collections import Counter


def normalize_results(raw_findings: list[dict]) -> tuple[list[dict], dict]:
    deduped: list[dict] = []
    seen: set[tuple] = set()

    for finding in raw_findings:
        key = (
            finding.get("title"),
            finding.get("file_path"),
            finding.get("url"),
            finding.get("severity"),
        )
        if key in seen:
            continue
        seen.add(key)
        deduped.append(finding)

    severity_counts = Counter(finding["severity"] for finding in deduped)
    summary = {
        "total": len(deduped),
        "severity_counts": dict(severity_counts),
        "sources": sorted({finding["source"] for finding in deduped}),
    }
    return deduped, summary

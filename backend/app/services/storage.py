def build_report_storage_key(scan_id: str, report_id: str, extension: str) -> str:
    return f"reports/{scan_id}/{report_id}.{extension}"

def get_rate_limit_config() -> dict:
    return {
        "auth": "10/minute",
        "scan_create": "5/minute",
        "report_create": "10/minute",
    }

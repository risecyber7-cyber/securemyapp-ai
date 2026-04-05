from urllib.parse import urlparse


def validate_target_ownership(base_url: str) -> dict:
    parsed = urlparse(base_url)
    is_https = parsed.scheme == "https"
    hostname = parsed.hostname or ""
    production_like = "." in hostname and hostname not in {"localhost", "127.0.0.1"}

    return {
        "hostname": hostname,
        "scheme": parsed.scheme,
        "is_https": is_https,
        "ownership_check": "dns_or_token_required" if production_like else "development_target",
        "safe_for_passive_scan": True,
    }

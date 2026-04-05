def inspect_cors(target_url: str, framework: str = "generic") -> list[dict]:
    return [
        {
            "category": "cors-review",
            "severity": "medium",
            "title": "CORS policy needs review",
            "description": f"Passive inspection suggests CORS review is needed for {target_url}.",
            "framework": framework,
        }
    ]

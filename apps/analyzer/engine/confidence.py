def calculate_confidence(severity: str, confidence: str) -> int:
    severity_scores = {"critical": 95, "high": 85, "medium": 72, "low": 60, "info": 45}
    confidence_bonus = {"high": 8, "medium": 0, "low": -10}
    return max(0, min(100, severity_scores.get(severity, 50) + confidence_bonus.get(confidence, 0)))

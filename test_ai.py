import os
import sys

# Ensure backend package can be imported
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.app.services.ai_fix_service import generate_fix_package

mock_finding = {
    "title": "Missing Content Security Policy",
    "category": "security_headers",
    "severity": "high",
    "framework": "nextjs",
    "file_path": "next.config.mjs",
    "evidence": {
        "headers": {"content-security-policy": None}
    }
}

if __name__ == "__main__":
    print("Sending mock finding to AI...")
    result = generate_fix_package("test-finding-123", mock_finding)
    
    print("\n=== AI RESPONSE ===")
    print(f"Title: {result.title}")
    print(f"Explanation: {result.explanation}")
    print(f"Confidence Score: {result.confidence_score}")
    print("\n--- Structured Explanation ---")
    if result.structured_explanation:
        print(f"Summary: {result.structured_explanation.summary}")
        print(f"Technical Explanation: {result.structured_explanation.technical_explanation}")
        print(f"Why it matters: {result.structured_explanation.why_it_matters}")
        print(f"Likely causes: {result.structured_explanation.likely_causes}")
    else:
        print("No structured explanation returned.")
        
    print("\n--- Exact Patch ---")
    print(result.code_snippet)
    
    print("\n--- Validation Steps ---")
    for step in result.validation_steps:
        print(f"- {step}")

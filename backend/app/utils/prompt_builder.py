import json
from textwrap import dedent


def sanitize_text(value: str | None, *, max_length: int = 4000) -> str:
    if not value:
        return ""
    compact = " ".join(value.strip().split())
    return compact[:max_length]


def build_fix_messages(finding: dict) -> tuple[str, str]:
    safe_payload = {
        "title": sanitize_text(finding.get("title"), max_length=160),
        "category": sanitize_text(finding.get("category"), max_length=80),
        "severity": sanitize_text(finding.get("severity"), max_length=32),
        "framework": sanitize_text(finding.get("framework"), max_length=80),
        "file_path": sanitize_text(finding.get("file_path"), max_length=220),
        "description": sanitize_text(finding.get("description"), max_length=1200),
        "cwe_ids": finding.get("cwe_ids", [])[:6],
        "owasp_tags": finding.get("owasp_tags", [])[:6],
        "evidence": finding.get("evidence", {}),
    }
    system_prompt = dedent(
        """
        You are a secure coding expert for SecureMyApp AI.
        Return only strict JSON with the following shape:
        {
          "explanation": {
            "title": string,
            "summary": string,
            "technical_explanation": string,
            "why_it_matters": string,
            "likely_causes": string,
            "remediation_overview": string,
            "safe_business_impact": string
          },
          "exact_patch": {
            "before": string,
            "after": string,
            "snippet": string,
            "config": string,
            "middleware": string
          },
          "implementation_steps": string[],
          "validation_checklist": string[]
        }
        Keep the guidance defensive, framework-specific, and production-safe.
        Never include secrets, attack payloads, or exploit instructions.
        """
    ).strip()
    user_prompt = f"Generate remediation JSON for this finding context: {json.dumps(safe_payload, ensure_ascii=True)}"
    return system_prompt, user_prompt


def build_assistant_messages(stack: dict, prompt: str, findings: list[dict]) -> tuple[str, str]:
    safe_context = {
        "stack": stack,
        "findings": findings[:8],
        "prompt": sanitize_text(prompt, max_length=1600),
    }
    system_prompt = dedent(
        """
        You are SecureMyApp AI's backend security assistant.
        Return only strict JSON with this shape:
        {
          "explanation": string,
          "secure_refactor_suggestions": string[],
          "answer": string
        }
        Keep answers concise, engineering-focused, and defensive.
        """
    ).strip()
    user_prompt = f"Summarize this workspace context and answer the user request: {json.dumps(safe_context, ensure_ascii=True)}"
    return system_prompt, user_prompt

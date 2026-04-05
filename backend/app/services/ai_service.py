from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.entities import Finding, RepositoryTarget, TargetSite
from backend.app.schemas.ai import AssistantResponse
from backend.app.services.openrouter_service import OpenRouterService
from backend.app.utils.prompt_builder import build_assistant_messages


def detect_stack(db: Session, workspace_id: str, project_id: str | None = None) -> dict:
    repositories_query = select(RepositoryTarget).where(RepositoryTarget.workspace_id == workspace_id)
    targets_query = select(TargetSite).where(TargetSite.workspace_id == workspace_id)

    if project_id:
        repositories_query = repositories_query.where(RepositoryTarget.project_id == project_id)
        targets_query = targets_query.where(TargetSite.project_id == project_id)

    repositories = db.scalars(repositories_query).all()
    targets = db.scalars(targets_query).all()

    return {
        "frontend": "nextjs" if repositories else "unknown",
        "backend": "fastapi",
        "targets": [target.base_url for target in targets],
        "repositories": [repository.repository_name for repository in repositories],
    }


def explain_issue_and_answer(db: Session, workspace_id: str, prompt: str, project_id: str | None = None) -> AssistantResponse:
    stack = detect_stack(db, workspace_id, project_id)
    findings = db.scalars(select(Finding)).all()
    top_categories = sorted({finding.category for finding in findings})[:6]
    compact_findings = [
        {
            "title": finding.title,
            "category": finding.category,
            "severity": finding.severity.value,
            "framework": finding.framework,
        }
        for finding in findings[:8]
    ]

    service = OpenRouterService()
    system_prompt, user_prompt = build_assistant_messages(stack, prompt, compact_findings)
    response = service.generate_json(system_prompt, user_prompt)

    explanation = (
        response.get("explanation")
        if response
        else "SecureMyApp AI analyzed workspace context, current findings, and framework signals before answering."
    )
    suggestions = (
        response.get("secure_refactor_suggestions")
        if response and response.get("secure_refactor_suggestions")
        else [
            "Centralize auth and workspace guards so protected routes share one access policy.",
            "Validate input with schemas before route or service logic runs.",
            "Prefer framework-level security defaults for headers, sessions, and secret handling.",
        ]
    )
    answer = (
        response.get("answer")
        if response
        else f"Detected stack: {stack}. Current findings point most strongly to {', '.join(top_categories) if top_categories else 'general hardening work'}."
    )

    return AssistantResponse(
        stack_detection=stack,
        explanation=explanation,
        secure_refactor_suggestions=suggestions,
        answer=answer,
    )

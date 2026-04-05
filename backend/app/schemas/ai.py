from pydantic import BaseModel, Field


class AssistantRequest(BaseModel):
    workspace_id: str
    prompt: str = Field(min_length=3, max_length=4000)
    project_id: str | None = None


class AssistantResponse(BaseModel):
    stack_detection: dict
    explanation: str
    secure_refactor_suggestions: list[str]
    answer: str

import json
import logging
from typing import Any

from openai import OpenAI

from backend.app.core.config import get_settings

logger = logging.getLogger(__name__)


class OpenRouterService:
    def __init__(self) -> None:
        settings = get_settings()
        self.model = settings.openrouter_model
        self.enabled = bool(settings.openrouter_api_key)
        self.client = (
            OpenAI(api_key=settings.openrouter_api_key, base_url=settings.openrouter_base_url)
            if self.enabled
            else None
        )
        self.timeout_seconds = settings.openrouter_timeout_seconds

    def generate_json(self, system_prompt: str, user_prompt: str) -> dict[str, Any] | None:
        if not self.enabled or self.client is None:
            return None

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                temperature=0.2,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                timeout=self.timeout_seconds,
            )
            content = response.choices[0].message.content or "{}"
            return json.loads(content)
        except Exception as exc:
            logger.warning("OpenRouter request failed: %s", exc.__class__.__name__)
            return None

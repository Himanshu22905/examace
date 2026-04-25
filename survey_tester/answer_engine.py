"""AI-powered answer selection engine for detected survey questions."""

from __future__ import annotations

import json
import random
from datetime import datetime, timedelta
from hashlib import sha256
from pathlib import Path
from typing import Any, Literal

from loguru import logger
from openai import AsyncOpenAI

from persona_generator import Persona

QuestionType = Literal["multiple_choice", "checkbox", "dropdown", "text", "rating", "date", "unknown"]


class AnswerEngine:
    """Selects persona-consistent answers using OpenAI with robust fallbacks."""

    def __init__(self, api_key: str, cache_path: str | Path) -> None:
        """Initialize answer engine with OpenAI client and cache path."""
        self._client = AsyncOpenAI(api_key=api_key)
        self._cache_path = Path(cache_path)
        self._cache = self._load_cache()

    def _load_cache(self) -> dict[str, Any]:
        """Load cached answers from disk."""
        if not self._cache_path.exists():
            return {}
        try:
            return json.loads(self._cache_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            logger.warning("Failed to read answer cache, starting fresh: {}", exc)
            return {}

    def _save_cache(self) -> None:
        """Persist answer cache to disk."""
        try:
            self._cache_path.parent.mkdir(parents=True, exist_ok=True)
            self._cache_path.write_text(json.dumps(self._cache, indent=2), encoding="utf-8")
        except OSError as exc:
            logger.warning("Failed to persist answer cache: {}", exc)

    def _question_hash(self, question_text: str, question_type: QuestionType, options: list[str]) -> str:
        """Compute stable hash for a question payload."""
        payload = f"{question_text}|{question_type}|{'|'.join(options)}"
        return sha256(payload.encode("utf-8")).hexdigest()

    def _cache_key(self, persona: Persona, question_hash: str) -> str:
        """Build cache key using persona identity and question hash."""
        return f"{persona.persona_id()}::{question_hash}"

    async def get_answer(
        self,
        question_text: str,
        question_type: QuestionType,
        options: list[str],
        persona: Persona,
    ) -> str | list[str] | int:
        """Get persona-consistent answer for a survey question.

        Returns:
            Answer value suitable for the question type.
        """
        q_hash = self._question_hash(question_text, question_type, options)
        key = self._cache_key(persona, q_hash)

        if key in self._cache:
            return self._cache[key]

        try:
            answer = await self._query_openai(question_text, question_type, options, persona)
        except Exception as exc:
            logger.warning("OpenAI answer failed, using fallback for question '{}': {}", question_text, exc)
            answer = self._fallback_answer(question_type, options, persona)

        self._cache[key] = answer
        self._save_cache()
        return answer

    async def _query_openai(
        self,
        question_text: str,
        question_type: QuestionType,
        options: list[str],
        persona: Persona,
    ) -> str | list[str] | int:
        """Call OpenAI to produce a structured answer."""
        prompt = {
            "instruction": "Choose a realistic answer that matches the persona.",
            "question_text": question_text,
            "question_type": question_type,
            "options": options,
            "persona": persona.model_dump(),
            "rules": {
                "multiple_choice": "Return exactly one option string from options.",
                "checkbox": "Return a list of 1 to 3 option strings from options.",
                "dropdown": "Return exactly one option string from options.",
                "text": "Return a concise but persona-consistent text response.",
                "rating": "Return one integer rating from provided options or sensible range.",
                "date": "Return a date string in YYYY-MM-DD format.",
            },
            "output_schema": {
                "answer": "string | number | array",
            },
        }

        response = await self._client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            temperature=0.6,
            messages=[
                {
                    "role": "system",
                    "content": "You are a survey respondent simulator. Return valid JSON only.",
                },
                {"role": "user", "content": json.dumps(prompt)},
            ],
        )

        content = response.choices[0].message.content or "{}"
        parsed = json.loads(content)
        answer = parsed.get("answer")

        return self._normalize_answer(answer, question_type, options, persona)

    def _normalize_answer(
        self,
        answer: Any,
        question_type: QuestionType,
        options: list[str],
        persona: Persona,
    ) -> str | list[str] | int:
        """Normalize model output into a valid value for each question type."""
        if question_type in {"multiple_choice", "dropdown"}:
            if isinstance(answer, str) and answer in options:
                return answer
            return self._fallback_answer(question_type, options, persona)

        if question_type == "checkbox":
            if isinstance(answer, list):
                valid = [str(item) for item in answer if str(item) in options]
                if valid:
                    return valid[: min(len(valid), 3)]
            return self._fallback_answer(question_type, options, persona)

        if question_type == "text":
            if isinstance(answer, str) and answer.strip():
                return answer.strip()
            return self._fallback_answer(question_type, options, persona)

        if question_type == "rating":
            if isinstance(answer, int):
                return answer
            if isinstance(answer, str) and answer.isdigit():
                return int(answer)
            return self._fallback_answer(question_type, options, persona)

        if question_type == "date":
            if isinstance(answer, str) and len(answer) == 10:
                return answer
            return self._fallback_answer(question_type, options, persona)

        return self._fallback_answer(question_type, options, persona)

    def _fallback_answer(
        self,
        question_type: QuestionType,
        options: list[str],
        persona: Persona,
    ) -> str | list[str] | int:
        """Return a safe random answer when model selection fails."""
        if question_type in {"multiple_choice", "dropdown"}:
            return random.choice(options) if options else ""

        if question_type == "checkbox":
            if not options:
                return []
            sample_size = random.randint(1, min(3, len(options)))
            return random.sample(options, k=sample_size)

        if question_type == "text":
            style_map = {
                "brief": "This was easy to complete and fairly clear.",
                "detailed": (
                    "Overall, the experience was decent. Some sections were straightforward, "
                    "but a few questions could be clearer for first-time respondents."
                ),
                "random": random.choice(
                    [
                        "It was fine for me.",
                        "I had mixed feelings while answering.",
                        "Clear flow and easy questions overall.",
                    ]
                ),
            }
            return style_map.get(persona.response_style, "It was okay.")

        if question_type == "rating":
            numeric_options = [int(opt) for opt in options if str(opt).isdigit()]
            if numeric_options:
                return random.choice(numeric_options)
            return random.randint(1, 5)

        if question_type == "date":
            days_back = random.randint(0, 180)
            chosen_date = datetime.utcnow() - timedelta(days=days_back)
            return chosen_date.strftime("%Y-%m-%d")

        return random.choice(options) if options else ""

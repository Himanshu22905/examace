"""Persona generation with OpenAI and on-disk caching."""

from __future__ import annotations

import json
import random
from hashlib import sha256
from pathlib import Path
from typing import Literal

from loguru import logger
from openai import AsyncOpenAI
from pydantic import BaseModel, Field, ValidationError


class Persona(BaseModel):
    """Represents a simulated survey respondent persona."""

    name: str = Field(min_length=2)
    age: int = Field(ge=18, le=90)
    gender: str = Field(min_length=2)
    location: str = Field(min_length=2)
    occupation: str = Field(min_length=2)
    income_level: Literal["low", "medium", "high"]
    education_level: str = Field(min_length=2)
    personality_traits: list[str] = Field(min_length=1)
    preferences: dict[str, str] = Field(default_factory=dict)
    response_style: Literal["brief", "detailed", "random"]

    def persona_id(self) -> str:
        """Build a stable persona identifier for caching and deduplication."""
        composite = f"{self.name}|{self.age}|{self.location}|{self.occupation}|{self.income_level}"
        return sha256(composite.encode("utf-8")).hexdigest()[:16]


class PersonaGenerationError(Exception):
    """Raised when persona generation fails irrecoverably."""


def _load_cached_personas(cache_path: Path, target_audience: str, count: int) -> list[Persona]:
    """Load persona cache from disk if it matches audience and required count."""
    if not cache_path.exists():
        return []

    try:
        payload = json.loads(cache_path.read_text(encoding="utf-8"))
        if payload.get("target_audience") != target_audience:
            return []
        cached_personas = [Persona.model_validate(item) for item in payload.get("personas", [])]
        if len(cached_personas) >= count:
            logger.info("Loaded {} personas from cache", count)
            return cached_personas[:count]
        return cached_personas
    except (OSError, json.JSONDecodeError, ValidationError) as exc:
        logger.warning("Persona cache ignored due to read/validation issue: {}", exc)
        return []


def _save_cached_personas(cache_path: Path, target_audience: str, personas: list[Persona]) -> None:
    """Persist personas to disk for future runs."""
    cache_payload = {
        "target_audience": target_audience,
        "personas": [persona.model_dump() for persona in personas],
    }
    try:
        cache_path.write_text(json.dumps(cache_payload, indent=2), encoding="utf-8")
    except OSError as exc:
        logger.warning("Failed to save personas cache: {}", exc)


async def _request_personas_from_openai(
    client: AsyncOpenAI,
    target_audience: str,
    count: int,
) -> list[Persona]:
    """Request personas from OpenAI and validate them with Pydantic."""
    system_prompt = (
        "You are an expert synthetic research participant generator. "
        "Return only valid JSON matching the requested schema."
    )
    user_prompt = (
        "Generate unique respondent personas for survey QA testing. "
        f"Target audience: {target_audience}. "
        f"Return exactly {count} personas in this JSON format: "
        "{\"personas\":[{\"name\":...,\"age\":...,\"gender\":...,\"location\":...,"
        "\"occupation\":...,\"income_level\":\"low|medium|high\",\"education_level\":...,"
        "\"personality_traits\":[...],\"preferences\":{\"key\":\"value\"},"
        "\"response_style\":\"brief|detailed|random\"}]}."
    )

    response = await client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        temperature=0.9,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )

    raw_content = response.choices[0].message.content or "{}"
    parsed = json.loads(raw_content)
    persona_items = parsed.get("personas", [])

    personas: list[Persona] = []
    for item in persona_items:
        try:
            personas.append(Persona.model_validate(item))
        except ValidationError as exc:
            logger.warning("Skipping invalid persona from model output: {}", exc)

    return personas


def _fallback_personas(target_audience: str, count: int) -> list[Persona]:
    """Generate local fallback personas when API calls fail."""
    names = [
        "Alex Rivera",
        "Priya Sharma",
        "Jordan Lee",
        "Maria Gomez",
        "Ethan Wright",
        "Aisha Khan",
        "Rohan Mehta",
        "Sofia Patel",
    ]
    occupations = ["Engineer", "Teacher", "Manager", "Designer", "Analyst", "Nurse"]
    traits = ["analytical", "impatient", "friendly", "detail-oriented", "skeptical", "curious"]
    education_levels = ["High School", "Bachelor's", "Master's", "PhD", "Diploma"]
    locations = ["New York, USA", "Chicago, USA", "Austin, USA", "Seattle, USA", "Atlanta, USA"]

    personas: list[Persona] = []
    for index in range(count):
        name = names[index % len(names)]
        selected_traits = random.sample(traits, k=2)
        persona = Persona(
            name=f"{name} {index + 1}",
            age=random.randint(20, 65),
            gender=random.choice(["Female", "Male", "Non-binary"]),
            location=random.choice(locations),
            occupation=random.choice(occupations),
            income_level=random.choice(["low", "medium", "high"]),
            education_level=random.choice(education_levels),
            personality_traits=selected_traits,
            preferences={
                "audience_alignment": target_audience,
                "decision_driver": random.choice(["price", "quality", "speed", "support"]),
            },
            response_style=random.choice(["brief", "detailed", "random"]),
        )
        personas.append(persona)

    return personas


async def generate_personas(
    api_key: str,
    target_audience: str,
    count: int,
    cache_path: str | Path,
) -> list[Persona]:
    """Generate or load respondent personas.

    Args:
        api_key: OpenAI API key.
        target_audience: User-defined audience profile.
        count: Number of personas to generate.
        cache_path: Path to personas cache JSON.

    Returns:
        A list of validated Persona objects.

    Raises:
        PersonaGenerationError: If no personas can be produced.
    """
    cache_file = Path(cache_path)
    cached = _load_cached_personas(cache_file, target_audience, count)
    if len(cached) >= count:
        return cached[:count]

    remaining = count - len(cached)
    generated: list[Persona] = []

    try:
        client = AsyncOpenAI(api_key=api_key)
        for attempt in range(1, 4):
            try:
                batch = await _request_personas_from_openai(client, target_audience, remaining)
                generated.extend(batch)
                if len(generated) >= remaining:
                    break
            except Exception as exc:
                logger.warning("Persona generation attempt {} failed: {}", attempt, exc)
        if len(generated) < remaining:
            logger.warning("Using local fallback personas for {} missing entries", remaining - len(generated))
            generated.extend(_fallback_personas(target_audience, remaining - len(generated)))
    except Exception as exc:
        logger.error("OpenAI client initialization or request failed: {}", exc)
        generated = _fallback_personas(target_audience, remaining)

    final_personas = (cached + generated)[:count]
    if not final_personas:
        raise PersonaGenerationError("Unable to generate personas")

    _save_cached_personas(cache_file, target_audience, final_personas)
    logger.info("Prepared {} personas", len(final_personas))
    return final_personas

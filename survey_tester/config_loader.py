"""Configuration loading and validation for the Survey QA Testing Bot."""

from __future__ import annotations

import json
from pathlib import Path

from pydantic import BaseModel, Field, HttpUrl, ValidationError, field_validator, model_validator


class DelayConfig(BaseModel):
    """Timing configuration used by the behavior engine."""

    min_seconds: float = Field(gt=0)
    max_seconds: float = Field(gt=0)
    typing_speed_ms: int = Field(gt=0)

    @model_validator(mode="after")
    def validate_range(self) -> "DelayConfig":
        """Ensure minimum delay is not greater than maximum delay."""
        if self.min_seconds > self.max_seconds:
            raise ValueError("delays.min_seconds must be less than or equal to delays.max_seconds")
        return self


class SurveyConfig(BaseModel):
    """Single survey target configuration."""

    name: str = Field(min_length=1)
    url: HttpUrl
    responses_per_run: int = Field(gt=0, le=5000)


class AppConfig(BaseModel):
    """Top-level application configuration."""

    surveys: list[SurveyConfig] = Field(min_length=1)
    target_audience: str = Field(min_length=5)
    openai_api_key: str = Field(min_length=10)
    delays: DelayConfig
    headless: bool
    output_dir: str = Field(min_length=1)

    @field_validator("openai_api_key")
    @classmethod
    def validate_api_key(cls, value: str) -> str:
        """Validate OpenAI API key format early for clearer user errors."""
        if not value.startswith("sk-"):
            raise ValueError("openai_api_key must start with 'sk-'")
        return value


class ConfigLoaderError(Exception):
    """Raised when configuration cannot be loaded or validated."""


def load_config(config_path: str | Path) -> AppConfig:
    """Load and validate a JSON configuration file.

    Args:
        config_path: Path to the JSON config file.

    Returns:
        A validated AppConfig object.

    Raises:
        ConfigLoaderError: If file read or validation fails.
    """
    path = Path(config_path)
    if not path.exists():
        raise ConfigLoaderError(f"Config file not found: {path}")

    try:
        raw_data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ConfigLoaderError(f"Invalid JSON in config file: {exc}") from exc
    except OSError as exc:
        raise ConfigLoaderError(f"Unable to read config file: {exc}") from exc

    try:
        return AppConfig.model_validate(raw_data)
    except ValidationError as exc:
        raise ConfigLoaderError(f"Config validation failed: {exc}") from exc

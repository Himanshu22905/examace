"""Data logging utilities for Excel exports and runtime logs."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

import pandas as pd
from loguru import logger

from persona_generator import Persona
from survey_bot import SurveyRunResult


class DataLogger:
    """Handles run logging and appending QA response rows into Excel files."""

    def __init__(self, output_dir: str) -> None:
        """Initialize output directory and loguru sinks."""
        self._output_dir = Path(output_dir)
        self._output_dir.mkdir(parents=True, exist_ok=True)
        self._configure_logger()

    def _configure_logger(self) -> None:
        """Configure loguru for both console and file output."""
        run_log_path = self._output_dir / "run_log.txt"
        logger.remove()
        logger.add(lambda message: print(message, end=""), level="INFO")
        logger.add(
            run_log_path,
            rotation="5 MB",
            retention=5,
            level="DEBUG",
            enqueue=True,
            backtrace=True,
            diagnose=False,
            format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
        )

    def append_survey_result(
        self,
        survey_name: str,
        persona: Persona,
        run_result: SurveyRunResult,
    ) -> Path:
        """Append one survey run output row to survey-specific Excel file."""
        file_path = self._output_dir / f"{self._safe_filename(survey_name)}.xlsx"

        row: dict[str, Any] = {
            "persona_name": persona.name,
            "age": persona.age,
            "gender": persona.gender,
            "occupation": persona.occupation,
            "personality": ", ".join(persona.personality_traits),
            "timestamp": run_result.completed_at,
            "status": run_result.status,
        }
        for question, answer in run_result.answers.items():
            if isinstance(answer, list):
                row[question] = ", ".join(str(item) for item in answer)
            else:
                row[question] = answer

        new_df = pd.DataFrame([row])
        final_df = self._merge_with_existing(file_path, new_df)
        final_df.to_excel(file_path, index=False, engine="openpyxl")
        logger.info("Saved survey result to {}", file_path)
        return file_path

    def _merge_with_existing(self, file_path: Path, new_df: pd.DataFrame) -> pd.DataFrame:
        """Merge new row with existing workbook rows while preserving all columns."""
        if file_path.exists():
            try:
                existing_df = pd.read_excel(file_path, engine="openpyxl")
                return pd.concat([existing_df, new_df], ignore_index=True, sort=False)
            except Exception as exc:
                logger.warning("Failed reading existing Excel file. Rebuilding file. Error: {}", exc)
                return new_df
        return new_df

    def _safe_filename(self, text: str) -> str:
        """Sanitize survey name for filesystem-safe Excel filenames."""
        cleaned = re.sub(r"[^a-zA-Z0-9_-]+", "_", text).strip("_")
        return cleaned or "survey_results"

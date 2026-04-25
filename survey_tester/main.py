"""CLI entry point and orchestrator for Survey QA Testing Bot System."""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

from loguru import logger
from rich.console import Console
from rich.progress import BarColumn, Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from rich.table import Table

from answer_engine import AnswerEngine
from behavior_engine import BehaviorEngine
from config_loader import AppConfig, ConfigLoaderError, load_config
from data_logger import DataLogger
from persona_generator import Persona, PersonaGenerationError, generate_personas
from survey_bot import SurveyBot


async def run(config_path: str = "config.json") -> None:
    """Run the complete survey QA testing workflow."""
    console = Console()

    try:
        config = load_config(config_path)
    except ConfigLoaderError as exc:
        console.print(f"[red]Configuration error:[/red] {exc}")
        return

    data_logger = DataLogger(config.output_dir)
    total_runs = sum(survey.responses_per_run for survey in config.surveys)

    try:
        personas = await generate_personas(
            api_key=config.openai_api_key,
            target_audience=config.target_audience,
            count=total_runs,
            cache_path=Path(config.output_dir) / "personas_cache.json",
        )
    except PersonaGenerationError as exc:
        console.print(f"[red]Persona generation failed:[/red] {exc}")
        return

    answer_engine = AnswerEngine(
        api_key=config.openai_api_key,
        cache_path=Path(config.output_dir) / "answer_cache.json",
    )
    behavior_engine = BehaviorEngine()
    survey_bot = SurveyBot(
        headless=config.headless,
        delays=config.delays,
        behavior_engine=behavior_engine,
        answer_engine=answer_engine,
    )

    summary: list[dict[str, Any]] = []
    persona_index = 0

    progress = Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        BarColumn(),
        TextColumn("[green]{task.completed}[/green]/[cyan]{task.total}[/cyan]"),
        TimeElapsedColumn(),
        console=console,
    )

    with progress:
        task_id = progress.add_task("Running survey QA tests", total=total_runs)

        try:
            for survey in config.surveys:
                completed = 0
                failed = 0
                output_file = Path(config.output_dir) / f"{_safe_summary_name(survey.name)}.xlsx"

                for _ in range(survey.responses_per_run):
                    persona = personas[persona_index]
                    persona_index += 1

                    progress.update(
                        task_id,
                        description=(
                            f"Survey: {survey.name} | Persona: {persona.name} | "
                            f"{completed + failed + 1}/{survey.responses_per_run}"
                        ),
                    )

                    run_result = await survey_bot.run_survey(str(survey.url), persona)
                    data_logger.append_survey_result(survey.name, persona, run_result)

                    if run_result.status == "completed":
                        completed += 1
                    else:
                        failed += 1
                        logger.warning(
                            "Survey '{}' failed for persona '{}': {}",
                            survey.name,
                            persona.name,
                            run_result.message,
                        )

                    progress.advance(task_id)

                summary.append(
                    {
                        "survey": survey.name,
                        "completed": completed,
                        "failed": failed,
                        "output": str(output_file),
                    }
                )

        except KeyboardInterrupt:
            logger.warning("KeyboardInterrupt received. Saving partial results and exiting cleanly.")
            console.print("\n[yellow]Interrupted by user. Partial results were saved.[/yellow]")

    _print_summary(console, summary)


def _safe_summary_name(text: str) -> str:
    """Create predictable output filename for summary references."""
    return "".join(char if char.isalnum() or char in "_-" else "_" for char in text).strip("_") or "survey_results"


def _print_summary(console: Console, summary: list[dict[str, Any]]) -> None:
    """Render final rich summary table."""
    table = Table(title="Survey QA Run Summary")
    table.add_column("Survey", style="cyan")
    table.add_column("Responses Completed", style="green")
    table.add_column("Responses Failed", style="red")
    table.add_column("Output File", style="magenta")

    if not summary:
        table.add_row("No surveys processed", "0", "0", "N/A")
    else:
        for item in summary:
            table.add_row(
                str(item["survey"]),
                str(item["completed"]),
                str(item["failed"]),
                str(item["output"]),
            )

    console.print(table)


if __name__ == "__main__":
    asyncio.run(run())

"""Playwright automation core for survey QA test execution."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from loguru import logger
from playwright.async_api import Browser, BrowserContext, Error, Page, TimeoutError, async_playwright

from answer_engine import AnswerEngine, QuestionType
from behavior_engine import BehaviorEngine
from config_loader import DelayConfig
from persona_generator import Persona


@dataclass
class DetectedQuestion:
    """Structured representation of a survey question extracted from the DOM."""

    key: str
    question_text: str
    question_type: QuestionType
    selector: str
    options: list[dict[str, str]] = field(default_factory=list)


@dataclass
class SurveyRunResult:
    """Execution result for one persona on one survey."""

    status: str
    message: str
    answers: dict[str, Any]
    completed_at: str


class SurveyBot:
    """Automates survey completion using Playwright and AI-generated answers."""

    def __init__(
        self,
        headless: bool,
        delays: DelayConfig,
        behavior_engine: BehaviorEngine,
        answer_engine: AnswerEngine,
    ) -> None:
        """Initialize the survey bot with runtime dependencies."""
        self._headless = headless
        self._delays = delays
        self._behavior = behavior_engine
        self._answer_engine = answer_engine

    async def run_survey(self, survey_url: str, persona: Persona) -> SurveyRunResult:
        """Run a single end-to-end survey submission for a persona."""
        answers: dict[str, Any] = {}
        browser: Browser | None = None
        context: BrowserContext | None = None

        try:
            async with async_playwright() as playwright:
                browser = await playwright.chromium.launch(headless=self._headless)
                context = await browser.new_context(
                    user_agent=(
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                    ),
                    locale="en-US",
                    extra_http_headers={
                        "Accept-Language": "en-US,en;q=0.9",
                        "DNT": "1",
                        "Upgrade-Insecure-Requests": "1",
                    },
                )
                page = await context.new_page()

                await self._navigate_with_retry(page, survey_url)

                if await self._is_survey_closed(page):
                    return self._result("skipped", "Survey appears closed or expired", answers)

                if await self._captcha_detected(page):
                    return self._result("skipped", "CAPTCHA detected; manual intervention required", answers)

                await self._fill_survey_pages(page, persona, answers)
                success = await self._submit_and_confirm(page)

                if success:
                    return self._result("completed", "Survey submitted successfully", answers)
                return self._result("failed", "Could not confirm survey submission", answers)

        except KeyboardInterrupt:
            logger.warning("Interrupted while processing persona {}", persona.name)
            return self._result("interrupted", "Run interrupted by user", answers)
        except Exception as exc:
            logger.exception("Survey run failed for persona {}: {}", persona.name, exc)
            return self._result("failed", f"Unexpected automation error: {exc}", answers)
        finally:
            if context is not None:
                await context.close()
            if browser is not None:
                await browser.close()

    async def _navigate_with_retry(self, page: Page, url: str) -> None:
        """Open survey URL with exponential-backoff retry on timeout/errors."""
        max_retries = 3
        for attempt in range(1, max_retries + 1):
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=40_000)
                await self._behavior.human_delay(self._delays.min_seconds, self._delays.max_seconds)
                return
            except TimeoutError as exc:
                if attempt == max_retries:
                    raise TimeoutError(f"Navigation timed out after {max_retries} attempts") from exc
                backoff = 2 ** attempt
                logger.warning("Navigation timeout (attempt {}), backing off {}s", attempt, backoff)
                await asyncio.sleep(backoff)
            except Error as exc:
                if attempt == max_retries:
                    raise
                backoff = 2 ** attempt
                logger.warning("Navigation error (attempt {}): {}. Retrying in {}s", attempt, exc, backoff)
                await asyncio.sleep(backoff)

    async def _fill_survey_pages(self, page: Page, persona: Persona, answers: dict[str, Any]) -> None:
        """Detect and answer questions across all paginated survey pages."""
        max_pages = 25
        current_page = 1

        while current_page <= max_pages:
            await self._behavior.human_scroll(page)
            await self._behavior.random_pause()

            if await self._captcha_detected(page):
                raise RuntimeError("CAPTCHA detected during run")

            questions = await self._detect_questions(page)
            if questions:
                await self._answer_questions(page, questions, persona, answers)

            next_clicked = await self._go_to_next_page_if_available(page)
            if not next_clicked:
                break

            current_page += 1
            await self._behavior.human_delay(self._delays.min_seconds, self._delays.max_seconds)

    async def _detect_questions(self, page: Page) -> list[DetectedQuestion]:
        """Scan DOM and classify supported question types."""
        script = """
        () => {
          const isVisible = (el) => {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
          };

          const cssPath = (el) => {
            if (el.id) return '#' + CSS.escape(el.id);
            if (el.name) {
              const tag = el.tagName.toLowerCase();
              return `${tag}[name="${el.name.replace(/"/g, '\\"')}"]`;
            }
            const parts = [];
            let current = el;
            while (current && current.nodeType === 1 && parts.length < 5) {
              let selector = current.tagName.toLowerCase();
              if (current.className && typeof current.className === 'string') {
                const className = current.className.trim().split(/\s+/)[0];
                if (className) selector += '.' + className;
              }
              const siblings = current.parentElement ? Array.from(current.parentElement.children).filter(s => s.tagName === current.tagName) : [];
              if (siblings.length > 1) {
                selector += `:nth-of-type(${siblings.indexOf(current) + 1})`;
              }
              parts.unshift(selector);
              current = current.parentElement;
            }
            return parts.join(' > ');
          };

          const getQuestionText = (el) => {
            const block = el.closest('fieldset, .question, .survey-question, .form-group, .ss-form-question, li, div') || el.parentElement;
            if (!block) return el.getAttribute('aria-label') || el.name || 'Untitled question';

            const legend = block.querySelector('legend');
            if (legend && legend.innerText.trim()) return legend.innerText.trim();

            const label = block.querySelector('label, h1, h2, h3, h4, p, span.question-title');
            if (label && label.innerText.trim()) return label.innerText.trim();

            return el.getAttribute('aria-label') || el.placeholder || el.name || 'Untitled question';
          };

          const inputs = Array.from(document.querySelectorAll('input, textarea, select')).filter(isVisible);
          const groups = new Map();

          for (const el of inputs) {
            const tag = el.tagName.toLowerCase();
            const type = (el.type || '').toLowerCase();
            const questionText = getQuestionText(el);
            const name = el.name || cssPath(el);
            const groupKey = (type === 'radio' || type === 'checkbox') ? `${type}::${name}` : cssPath(el);

            if (!groups.has(groupKey)) {
              let qType = 'unknown';
              if (type === 'radio') qType = 'multiple_choice';
              else if (type === 'checkbox') qType = 'checkbox';
              else if (tag === 'select') qType = 'dropdown';
              else if (tag === 'textarea' || ['text', 'email', 'tel', 'search', 'url'].includes(type)) qType = 'text';
              else if (type === 'date') qType = 'date';
              else if (type === 'range' || type === 'number') qType = 'rating';

              groups.set(groupKey, {
                key: groupKey,
                question_text: questionText,
                question_type: qType,
                selector: cssPath(el),
                options: [],
              });
            }

            const group = groups.get(groupKey);

            if (type === 'radio' || type === 'checkbox') {
              const label = el.id ? document.querySelector(`label[for="${el.id.replace(/"/g, '\\"')}"]`) : null;
              const optionText = (label?.innerText || el.value || '').trim() || 'Option';
              group.options.push({
                text: optionText,
                value: el.value || optionText,
                selector: cssPath(el),
              });
            }

            if (tag === 'select') {
              group.options = Array.from(el.options)
                .filter(opt => opt.value && opt.textContent.trim())
                .map(opt => ({ text: opt.textContent.trim(), value: opt.value, selector: cssPath(el) }));
            }

            if (group.question_type === 'rating' && type === 'range') {
              const min = parseInt(el.min || '1', 10);
              const max = parseInt(el.max || '5', 10);
              if (!Number.isNaN(min) && !Number.isNaN(max) && max >= min) {
                group.options = [];
                for (let i = min; i <= max; i++) {
                  group.options.push({ text: String(i), value: String(i), selector: cssPath(el) });
                }
              }
            }
          }

          return Array.from(groups.values());
        }
        """

        raw_questions = await page.evaluate(script)
        detected: list[DetectedQuestion] = []
        seen_keys: set[str] = set()

        for item in raw_questions:
            key = str(item.get("key", ""))
            if not key or key in seen_keys:
                continue
            seen_keys.add(key)
            detected.append(
                DetectedQuestion(
                    key=key,
                    question_text=str(item.get("question_text", "Untitled question")).strip(),
                    question_type=item.get("question_type", "unknown"),
                    selector=str(item.get("selector", "")).strip(),
                    options=[
                        {
                            "text": str(option.get("text", "")).strip(),
                            "value": str(option.get("value", "")).strip(),
                            "selector": str(option.get("selector", "")).strip(),
                        }
                        for option in item.get("options", [])
                    ],
                )
            )

        return [q for q in detected if q.selector]

    async def _answer_questions(
        self,
        page: Page,
        questions: list[DetectedQuestion],
        persona: Persona,
        answer_log: dict[str, Any],
    ) -> None:
        """Answer each detected question using AI answer selection and human-like actions."""
        for question in questions:
            try:
                option_texts = [opt["text"] for opt in question.options if opt.get("text")]
                answer = await self._answer_engine.get_answer(
                    question_text=question.question_text,
                    question_type=question.question_type,
                    options=option_texts,
                    persona=persona,
                )

                await self._apply_answer(page, question, answer)
                answer_log[question.question_text] = answer
                await self._behavior.human_delay(self._delays.min_seconds, self._delays.max_seconds)
            except Exception as exc:
                logger.warning("Failed to answer question '{}': {}", question.question_text, exc)

    async def _apply_answer(self, page: Page, question: DetectedQuestion, answer: Any) -> None:
        """Apply a generated answer to the corresponding survey control(s)."""
        locator = page.locator(question.selector).first

        if question.question_type in {"multiple_choice", "dropdown"}:
            selected = self._match_option(question.options, str(answer))
            if question.question_type == "multiple_choice" and selected:
                await self._behavior.human_click(page, selected["selector"])
            elif question.question_type == "dropdown":
                selected_value = selected["value"] if selected else str(answer)
                await locator.select_option(value=selected_value)

        elif question.question_type == "checkbox":
            answers = answer if isinstance(answer, list) else [str(answer)]
            for item in answers:
                selected = self._match_option(question.options, str(item))
                if selected:
                    option_locator = page.locator(selected["selector"]).first
                    if not await option_locator.is_checked():
                        await self._behavior.human_click_locator(page, option_locator)

        elif question.question_type == "text":
            await locator.fill("")
            await self._behavior.human_click_locator(page, locator)
            await self._behavior.human_type_locator(locator, str(answer), self._delays.typing_speed_ms)

        elif question.question_type == "rating":
            if question.options:
                selected = self._match_option(question.options, str(answer))
                if selected and selected.get("selector") != question.selector:
                    await self._behavior.human_click(page, selected["selector"])
                else:
                    await locator.fill(str(answer))
            else:
                await locator.fill(str(answer))

        elif question.question_type == "date":
            await locator.fill(str(answer))

        else:
            if await locator.count() > 0:
                await locator.fill(str(answer))

    def _match_option(self, options: list[dict[str, str]], chosen: str) -> dict[str, str] | None:
        """Find best matching option by exact or fuzzy text match."""
        if not options:
            return None

        exact = next((opt for opt in options if opt["text"].strip().lower() == chosen.strip().lower()), None)
        if exact is not None:
            return exact

        fuzzy = next((opt for opt in options if chosen.strip().lower() in opt["text"].strip().lower()), None)
        if fuzzy is not None:
            return fuzzy

        return options[0]

    async def _go_to_next_page_if_available(self, page: Page) -> bool:
        """Click next/continue button if a paginated flow is detected."""
        next_locator = page.locator(
            "button:has-text('Next'), button:has-text('Continue'), "
            "input[type='button'][value*='Next'], input[type='button'][value*='Continue']"
        ).first

        if await next_locator.count() == 0:
            return False

        if await next_locator.is_visible():
            await self._behavior.human_click_locator(page, next_locator)
            await self._behavior.human_delay(self._delays.min_seconds, self._delays.max_seconds)
            if await self._has_validation_error(page):
                logger.info("Validation errors detected after next click, retrying answer pass")
                return False
            return True

        return False

    async def _submit_and_confirm(self, page: Page) -> bool:
        """Submit survey and verify success message/state."""
        submit_locator = page.locator(
            "button:has-text('Submit'), button:has-text('Finish'), button:has-text('Done'), "
            "input[type='submit'], input[value*='Submit'], input[value*='Finish']"
        ).first

        if await submit_locator.count() == 0:
            return await self._is_success_page(page)

        await self._behavior.human_click_locator(page, submit_locator)
        await self._behavior.human_delay(self._delays.min_seconds, self._delays.max_seconds)

        if await self._has_validation_error(page):
            logger.warning("Validation error present after submit")
            return False

        return await self._is_success_page(page)

    async def _is_success_page(self, page: Page) -> bool:
        """Detect common success confirmation texts after submission."""
        success_selectors = [
            "text=Thank you",
            "text=Response recorded",
            "text=submitted",
            "text=Your response has been recorded",
            "text=completed",
        ]
        for selector in success_selectors:
            if await page.locator(selector).first.count() > 0:
                return True
        return False

    async def _is_survey_closed(self, page: Page) -> bool:
        """Detect common survey-closed or expired states."""
        closed_texts = ["survey is closed", "no longer accepting responses", "expired", "form is no longer available"]
        page_text = (await page.content()).lower()
        return any(text in page_text for text in closed_texts)

    async def _has_validation_error(self, page: Page) -> bool:
        """Detect required field/validation errors on current page."""
        error_locator = page.locator("[aria-invalid='true'], .error, .validation-error, [role='alert']")
        return await error_locator.count() > 0

    async def _captcha_detected(self, page: Page) -> bool:
        """Detect CAPTCHA presence and return whether run should be skipped."""
        captcha_locators = [
            "iframe[src*='captcha']",
            "div.g-recaptcha",
            "text=I am not a robot",
            "text=captcha",
        ]
        for selector in captcha_locators:
            if await page.locator(selector).first.count() > 0:
                return True
        return False

    def _result(self, status: str, message: str, answers: dict[str, Any]) -> SurveyRunResult:
        """Create standardized run result object."""
        return SurveyRunResult(
            status=status,
            message=message,
            answers=answers,
            completed_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        )

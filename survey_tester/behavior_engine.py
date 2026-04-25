"""Human-like interaction behaviors for survey automation."""

from __future__ import annotations

import asyncio
import random

from playwright.async_api import Locator, Page


class BehaviorEngine:
    """Provides randomized human-style browser interactions."""

    async def human_delay(self, min_seconds: float, max_seconds: float) -> None:
        """Sleep using gaussian-distributed delay bounded by configured min/max."""
        mean = (min_seconds + max_seconds) / 2
        std_dev = max((max_seconds - min_seconds) / 6, 0.05)
        delay = random.gauss(mean, std_dev)
        bounded_delay = max(min_seconds, min(max_seconds, delay))
        await asyncio.sleep(bounded_delay)

    async def human_type(self, page: Page, selector: str, text: str, wpm: int) -> None:
        """Type text char-by-char with occasional typo and correction simulation."""
        locator = page.locator(selector).first
        await locator.click()
        await self.human_type_locator(locator, text, wpm)

    async def human_type_locator(self, locator: Locator, text: str, typing_speed_ms: int) -> None:
        """Type into a locator with realistic randomness and typo corrections."""
        typo_probability = 0.06
        typo_chars = "abcdefghijklmnopqrstuvwxyz"

        for char in text:
            if random.random() < typo_probability and char.isalpha():
                typo = random.choice(typo_chars)
                await locator.type(typo)
                await asyncio.sleep(max(typing_speed_ms / 1000 * random.uniform(0.6, 1.4), 0.01))
                await locator.press("Backspace")

            await locator.type(char)
            jitter = max(typing_speed_ms / 1000 * random.uniform(0.5, 1.6), 0.01)
            await asyncio.sleep(jitter)

    async def human_click(self, page: Page, selector: str) -> None:
        """Click a selector after moving mouse with a slight random offset."""
        locator = page.locator(selector).first
        await self.human_click_locator(page, locator)

    async def human_click_locator(self, page: Page, locator: Locator) -> None:
        """Click an element with realistic mouse movement using element bounds."""
        box = await locator.bounding_box()
        if box is not None:
            offset_x = random.gauss(0, box["width"] * 0.08)
            offset_y = random.gauss(0, box["height"] * 0.08)
            target_x = box["x"] + box["width"] / 2 + offset_x
            target_y = box["y"] + box["height"] / 2 + offset_y
            await page.mouse.move(target_x, target_y, steps=random.randint(8, 20))
        await locator.click(timeout=10_000)

    async def human_scroll(self, page: Page) -> None:
        """Perform randomized multi-step scroll movement."""
        scroll_steps = max(1, int(abs(random.gauss(4, 1.5))))
        for _ in range(scroll_steps):
            delta = int(random.gauss(360, 160))
            delta = max(120, min(900, delta))
            await page.mouse.wheel(0, delta)
            await asyncio.sleep(max(random.gauss(0.3, 0.12), 0.08))

    async def random_pause(self) -> None:
        """Occasionally pause longer to simulate respondent reading time."""
        if random.random() < 0.35:
            duration = max(random.gauss(2.2, 0.9), 0.5)
            await asyncio.sleep(duration)

"""Summary generation, abstracted so a real LLM can sit behind the same
interface as the zero-config heuristic. get_summary_generator() decides
which implementation to use based on whether ANTHROPIC_API_KEY is set —
callers never need to know which one they got.
"""
import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.config import settings

logger = logging.getLogger("fireflies.ai_summary")


@dataclass
class GeneratedSummary:
    overview_text: str
    topics: list[str]
    action_items: list[str]


class SummaryGenerator(ABC):
    @abstractmethod
    def generate(self, transcript_text: str) -> GeneratedSummary: ...


def _split_speaker_line(line: str) -> tuple[str | None, str]:
    """meeting_service always formats lines as "Speaker: text" (falling back
    to "Unknown"); tolerate anything else by treating the whole line as text.
    """
    name, sep, rest = line.partition(": ")
    return (name.strip(), rest.strip()) if sep else (None, line.strip())


def _join_names(names: list[str]) -> str:
    if not names:
        return "the attendees"
    if len(names) == 1:
        return names[0]
    if len(names) == 2:
        return f"{names[0]} and {names[1]}"
    return f"{', '.join(names[:-1])}, and {names[-1]}"


def _trim(text: str, limit: int = 110) -> str:
    # Strip trailing sentence punctuation too, since callers embed the result
    # in quotes followed by their own period — avoids '..."' / '?".' doubles.
    text = text.strip().rstrip(".!?")
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


class HeuristicSummaryGenerator(SummaryGenerator):
    """Deterministic, content-aware placeholder. Needs no API key or network
    access, so meeting creation always works out of the box; swap in
    LLMSummaryGenerator (set ANTHROPIC_API_KEY) for real model-written
    summaries without touching any caller.
    """

    def generate(self, transcript_text: str) -> GeneratedSummary:
        lines = [_split_speaker_line(line) for line in transcript_text.splitlines() if line.strip()]
        if not lines:
            return GeneratedSummary(overview_text="No transcript content to summarize.", topics=[], action_items=[])

        speakers: list[str] = []
        for name, _ in lines:
            if name and name not in speakers:
                speakers.append(name)

        opening = _trim(lines[0][1])
        overview = f"A {len(lines)}-turn conversation between {_join_names(speakers)}."
        if opening:
            overview += f' It opened with: "{opening}"'
        if len(lines) > 1:
            closing = _trim(lines[-1][1])
            if closing and closing != opening:
                overview += f' and wrapped up around: "{closing}"'
        overview += "."

        # Topics are left empty here — meeting_service falls back to its own
        # timestamp-anchored snippet titles when no topics are supplied.
        return GeneratedSummary(overview_text=overview, topics=[], action_items=[])


class LLMSummaryGenerator(SummaryGenerator):
    """Calls Claude to produce a real summary from the transcript text. Only
    constructed when ANTHROPIC_API_KEY is configured; get_summary_generator()
    wraps it so any failure (bad key, network, malformed response) falls back
    to HeuristicSummaryGenerator instead of failing meeting creation.
    """

    MODEL = "claude-haiku-4-5-20251001"

    def __init__(self) -> None:
        import anthropic  # imported lazily so it's only required when actually used

        self._client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    def generate(self, transcript_text: str) -> GeneratedSummary:
        message = self._client.messages.create(
            model=self.MODEL,
            max_tokens=700,
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Summarize this meeting transcript for a meeting-notes app. "
                        "Respond with ONLY minified JSON, no prose, matching exactly: "
                        '{"overview": string, "topics": string[], "action_items": string[]}. '
                        "overview: 2-3 sentences describing what was discussed and decided. "
                        "topics: up to 5 short chapter titles (3-6 words each) in chronological order. "
                        "action_items: concrete follow-up tasks explicitly mentioned, phrased as "
                        '"<name>: <task>" when a person is identifiable, or [] if none.\n\n'
                        f"Transcript:\n{transcript_text}"
                    ),
                }
            ],
        )
        raw = "".join(block.text for block in message.content if block.type == "text")
        data = json.loads(raw)
        return GeneratedSummary(
            overview_text=str(data.get("overview", "")).strip() or "Summary unavailable.",
            topics=[str(t).strip() for t in data.get("topics", []) if str(t).strip()],
            action_items=[str(a).strip() for a in data.get("action_items", []) if str(a).strip()],
        )


class _FallbackGenerator(SummaryGenerator):
    """Tries `primary`; on any error, logs a warning and uses `fallback` so a
    flaky external call never breaks meeting creation.
    """

    def __init__(self, primary: SummaryGenerator, fallback: SummaryGenerator) -> None:
        self._primary = primary
        self._fallback = fallback

    def generate(self, transcript_text: str) -> GeneratedSummary:
        try:
            return self._primary.generate(transcript_text)
        except Exception:
            logger.warning("LLM summary generation failed, falling back to heuristic", exc_info=True)
            return self._fallback.generate(transcript_text)


def get_summary_generator() -> SummaryGenerator:
    if settings.anthropic_api_key:
        try:
            llm = LLMSummaryGenerator()
        except ImportError:
            logger.warning("ANTHROPIC_API_KEY is set but the 'anthropic' package isn't installed; using heuristic")
        else:
            return _FallbackGenerator(llm, HeuristicSummaryGenerator())
    return HeuristicSummaryGenerator()

"""Parses a pasted or uploaded transcript into segments.

Three input formats are auto-detected from the raw text, so the API needs
only a single `transcript_text` string field regardless of how the frontend
got it (a textarea paste, or a .txt/.vtt/.json file read client-side):

- **Plain / .txt** (the primary, prioritized path): one turn per line,
  ``[MM:SS] Speaker Name: What they said``. Lines that don't match are
  treated as a continuation of the previous line's text, so multi-line
  utterances work without extra syntax.
- **WebVTT / .vtt**: standard ``HH:MM:SS.mmm --> HH:MM:SS.mmm`` cues, sniffed
  by a leading ``WEBVTT`` line.
- **JSON / .json**: an array of ``{speaker, start, end, text}`` objects
  (matching this app's own segment shape), sniffed by a leading ``[`` or ``{``.

No real speech-to-text happens here — this only turns already-transcribed
text into structured segments.
"""
import json
import re
from dataclasses import dataclass, field


class TranscriptParseError(Exception):
    """Raised for transcript text that doesn't match any supported format."""


@dataclass
class ParsedSegment:
    start_time_sec: float
    end_time_sec: float
    text: str
    speaker_name: str | None = field(default=None)


_PLAIN_LINE_RE = re.compile(
    r"^\[?(?P<time>\d{1,2}:\d{2}(?::\d{2})?)\]?\s*[-–—]?\s*(?P<speaker>[^:\n]{1,80}):\s*(?P<text>.+)$"
)
_VTT_CUE_RE = re.compile(r"(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})")
_VTT_TIME_RE = re.compile(r"(\d{2}):(\d{2}):(\d{2})[.,](\d{3})")
_SPEAKER_PREFIX_RE = re.compile(r"^(?P<speaker>[^:\n]{1,80}):\s*(?P<text>.+)$")


def parse_transcript(raw_text: str) -> list[ParsedSegment]:
    stripped = raw_text.strip()
    if not stripped:
        raise TranscriptParseError("Transcript is empty.")

    if stripped.upper().startswith("WEBVTT"):
        return _parse_vtt(stripped)

    if stripped[0] == "[":
        # Could be a JSON array, or a plain-text line like "[00:00] Speaker:
        # text" — both start with '['. Only commit to the JSON path if it
        # actually parses as a JSON array; otherwise fall through to plain
        # parsing rather than raising a JSON-specific error on valid plain text.
        json_data = _try_parse_json_array(stripped)
        if json_data is not None:
            return _segments_from_json(json_data)

    return _parse_plain(stripped)


def _try_parse_json_array(text: str) -> list | None:
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return None
    return data if isinstance(data, list) else None


def _parse_time(value: str) -> float:
    parts = [int(p) for p in value.split(":")]
    if len(parts) == 2:
        minutes, seconds = parts
        return float(minutes * 60 + seconds)
    hours, minutes, seconds = parts
    return float(hours * 3600 + minutes * 60 + seconds)


def _parse_plain(text: str) -> list[ParsedSegment]:
    segments: list[ParsedSegment] = []

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        match = _PLAIN_LINE_RE.match(line)
        if match:
            start = _parse_time(match.group("time"))
            segments.append(
                ParsedSegment(
                    speaker_name=match.group("speaker").strip(),
                    start_time_sec=start,
                    end_time_sec=start,
                    text=match.group("text").strip(),
                )
            )
        elif segments:
            # No timestamp/speaker prefix — a continuation of the previous turn.
            segments[-1].text = f"{segments[-1].text} {line}"
        # Otherwise: junk before the first recognizable line. Skip it.

    if not segments:
        raise TranscriptParseError(
            "Couldn't find any lines in the expected format "
            "'[MM:SS] Speaker Name: text'. Check the transcript formatting."
        )

    _fill_end_times(segments)
    return segments


def _fill_end_times(segments: list[ParsedSegment]) -> None:
    """Plain-text lines only carry a start time; each segment's end is
    inferred as the next segment's start, and the last one gets a duration
    estimated from its word count (roughly 2.5 words/sec of speech)."""
    for index, segment in enumerate(segments):
        if index + 1 < len(segments):
            segment.end_time_sec = max(segment.start_time_sec, segments[index + 1].start_time_sec)
        else:
            estimated = max(3.0, len(segment.text.split()) / 2.5)
            segment.end_time_sec = segment.start_time_sec + estimated


def _parse_vtt(text: str) -> list[ParsedSegment]:
    segments: list[ParsedSegment] = []

    for block in re.split(r"\n\s*\n", text.strip()):
        lines = [line for line in block.splitlines() if line.strip()]
        cue_index = next((i for i, line in enumerate(lines) if "-->" in line), None)
        if cue_index is None:
            continue

        cue_match = _VTT_CUE_RE.search(lines[cue_index])
        if not cue_match:
            continue

        content = " ".join(lines[cue_index + 1 :]).strip()
        if not content:
            continue

        speaker_match = _SPEAKER_PREFIX_RE.match(content)
        speaker = speaker_match.group("speaker").strip() if speaker_match else None
        body = speaker_match.group("text").strip() if speaker_match else content

        segments.append(
            ParsedSegment(
                speaker_name=speaker,
                start_time_sec=_vtt_time_to_seconds(cue_match.group(1)),
                end_time_sec=_vtt_time_to_seconds(cue_match.group(2)),
                text=body,
            )
        )

    if not segments:
        raise TranscriptParseError("No valid WebVTT cues found in the transcript.")
    return segments


def _vtt_time_to_seconds(value: str) -> float:
    match = _VTT_TIME_RE.match(value)
    if not match:
        raise TranscriptParseError(f"Malformed VTT timestamp: {value!r}")
    hours, minutes, seconds, millis = match.groups()
    return int(hours) * 3600 + int(minutes) * 60 + int(seconds) + int(millis) / 1000


def _segments_from_json(data: list) -> list[ParsedSegment]:
    if not data:
        raise TranscriptParseError("JSON transcript must be a non-empty array of segments.")

    segments: list[ParsedSegment] = []
    for index, item in enumerate(data):
        if not isinstance(item, dict):
            raise TranscriptParseError(f"Segment {index} is not an object.")
        try:
            start = float(item.get("start_time_sec", item.get("start", 0)))
            end = float(item.get("end_time_sec", item.get("end", start)))
            text_value = str(item["text"]).strip()
        except (KeyError, TypeError, ValueError) as exc:
            raise TranscriptParseError(f"Segment {index} is missing a valid 'text' or time field.") from exc

        if not text_value:
            raise TranscriptParseError(f"Segment {index} has empty text.")

        speaker = item.get("speaker") or item.get("speaker_name")
        segments.append(
            ParsedSegment(
                speaker_name=str(speaker).strip() if speaker else None,
                start_time_sec=start,
                end_time_sec=max(end, start),
                text=text_value,
            )
        )
    return segments

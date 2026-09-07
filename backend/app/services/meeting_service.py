"""Business logic for meetings and their nested resources (transcript,
summary, topics). Routers call these functions and stay a thin HTTP layer;
repositories stay a thin data-access layer. This module is where the two
meet — participant validation, existence checks, and orchestration live here.
"""
from datetime import date as date_type

from sqlalchemy.orm import Session

from app.exceptions import InvalidInputError, NotFoundError
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.summary import Summary
from app.models.topic import Topic
from app.models.transcript import TranscriptSegment
from app.repositories import meeting_repository, participant_repository, user_repository
from app.schemas.meeting import MeetingCreate, MeetingUpdate
from app.services.ai_summary import get_summary_generator
from app.services.transcript_parser import ParsedSegment, TranscriptParseError, parse_transcript


def _resolve_participants(db: Session, participant_ids: list[int]) -> list[Participant]:
    if not participant_ids:
        return []
    participants = participant_repository.get_by_ids(db, participant_ids)
    found_ids = {p.id for p in participants}
    missing = set(participant_ids) - found_ids
    if missing:
        raise InvalidInputError(f"Unknown participant_ids: {sorted(missing)}")
    return participants


def _ensure_meeting_exists(db: Session, meeting_id: int) -> None:
    if meeting_repository.get_by_id(db, meeting_id) is None:
        raise NotFoundError("Meeting", meeting_id)


def list_meetings(
    db: Session,
    *,
    search: str | None = None,
    participant: str | None = None,
    on_date: date_type | None = None,
    sort: str = "recent",
) -> list[Meeting]:
    return meeting_repository.list_meetings(
        db, search=search, participant=participant, on_date=on_date, sort=sort
    )


def get_meeting(db: Session, meeting_id: int) -> Meeting:
    meeting = meeting_repository.get_by_id(db, meeting_id, *meeting_repository.DETAIL_LOAD_OPTIONS)
    if meeting is None:
        raise NotFoundError("Meeting", meeting_id)
    return meeting


def create_meeting(db: Session, payload: MeetingCreate) -> Meeting:
    """Creates a meeting, optionally from a pasted/uploaded transcript in one
    atomic transaction: parse the transcript, create its segments, link or
    create speaker participants, and generate a mocked summary + topics.
    Action items are deliberately not generated here — the assignment adds
    those later through the action-items UI, not at creation time.
    """
    user = user_repository.get_default_user(db)
    selected_participants = _resolve_participants(db, payload.participant_ids)

    parsed_segments: list[ParsedSegment] = []
    if payload.transcript_text and payload.transcript_text.strip():
        try:
            parsed_segments = parse_transcript(payload.transcript_text)
        except TranscriptParseError as exc:
            raise InvalidInputError(str(exc)) from exc

    meeting = Meeting(
        user_id=user.id,
        title=payload.title,
        date=payload.date,
        duration_seconds=_resolve_duration(payload.duration_seconds, parsed_segments),
        media_url=payload.media_url,
        participants=selected_participants,
    )
    db.add(meeting)
    db.flush()  # assigns meeting.id for the child rows below, without committing yet

    if parsed_segments:
        _attach_transcript(db, meeting, selected_participants, parsed_segments)

    db.commit()
    return get_meeting(db, meeting.id)


def _resolve_duration(provided: int, segments: list[ParsedSegment]) -> int:
    if provided > 0 or not segments:
        return provided
    return int(segments[-1].end_time_sec) + 5


def _attach_transcript(
    db: Session,
    meeting: Meeting,
    selected_participants: list[Participant],
    segments: list[ParsedSegment],
) -> None:
    speakers_by_name: dict[str, Participant] = {p.name.lower(): p for p in selected_participants}
    attendees = list(selected_participants)

    for index, segment in enumerate(segments):
        speaker: Participant | None = None
        if segment.speaker_name:
            key = segment.speaker_name.lower()
            speaker = speakers_by_name.get(key) or participant_repository.find_by_name(db, segment.speaker_name)
            if speaker is None:
                speaker = Participant(name=segment.speaker_name)
                db.add(speaker)
                db.flush()
            if key not in speakers_by_name:
                speakers_by_name[key] = speaker
                attendees.append(speaker)

        db.add(
            TranscriptSegment(
                meeting_id=meeting.id,
                speaker_id=speaker.id if speaker else None,
                start_time_sec=segment.start_time_sec,
                end_time_sec=segment.end_time_sec,
                text=segment.text,
                order_index=index,
            )
        )

    # The transcript is the ground truth for who actually attended — fold
    # any newly linked/created speakers into the meeting's participant list.
    meeting.participants = attendees

    full_text = "\n".join(f"{segment.speaker_name or 'Unknown'}: {segment.text}" for segment in segments)
    generated = get_summary_generator().generate(full_text)
    db.add(Summary(meeting_id=meeting.id, overview_text=generated.overview_text))

    for order_index, (title, start_time_sec) in enumerate(_derive_topics(segments, generated.topics)):
        db.add(Topic(meeting_id=meeting.id, title=title, order_index=order_index, start_time_sec=start_time_sec))


def _derive_topics(segments: list[ParsedSegment], generated_titles: list[str]) -> list[tuple[str, float]]:
    """Picks a handful of evenly-spaced segments across the transcript as
    topic timestamps ("jump to this point" stays accurate even without real
    topic modeling), and titles each one from `generated_titles` — the
    summary generator's own topic list — when available, falling back to a
    snippet of that segment's text otherwise (the heuristic generator
    deliberately returns no topics, so this is always the fallback path
    unless a real LLM generator is configured).
    """
    if not segments:
        return []

    topic_count = min(6, max(1, len(segments) // 4))
    step = max(1, len(segments) // topic_count)

    indices: list[int] = []
    for i in range(0, len(segments), step):
        if len(indices) >= topic_count:
            break
        indices.append(i)

    topics: list[tuple[str, float]] = []
    for slot, i in enumerate(indices):
        title = generated_titles[slot] if slot < len(generated_titles) else ""
        if not title:
            words = segments[i].text.split()
            title = " ".join(words[:7]) + ("…" if len(words) > 7 else "")
        topics.append((title, segments[i].start_time_sec))
    return topics


def update_meeting(db: Session, meeting_id: int, payload: MeetingUpdate) -> Meeting:
    """Full replace (PUT): every scalar field is overwritten, and
    participants become exactly payload.participant_ids (an empty list
    clears them) — that's what distinguishes PUT from a partial PATCH.
    """
    meeting = get_meeting(db, meeting_id)

    meeting.title = payload.title
    meeting.date = payload.date
    meeting.duration_seconds = payload.duration_seconds
    meeting.media_url = payload.media_url
    meeting.participants = _resolve_participants(db, payload.participant_ids)

    meeting_repository.save(db, meeting)
    return get_meeting(db, meeting_id)


def delete_meeting(db: Session, meeting_id: int) -> None:
    meeting = meeting_repository.get_by_id(db, meeting_id)
    if meeting is None:
        raise NotFoundError("Meeting", meeting_id)
    meeting_repository.delete(db, meeting)


def get_transcript(db: Session, meeting_id: int) -> list[TranscriptSegment]:
    _ensure_meeting_exists(db, meeting_id)
    return meeting_repository.get_transcript_segments(db, meeting_id)


def get_summary(db: Session, meeting_id: int) -> Summary:
    _ensure_meeting_exists(db, meeting_id)
    summary = meeting_repository.get_summary(db, meeting_id)
    if summary is None:
        raise NotFoundError("Summary for meeting", meeting_id)
    return summary


def get_topics(db: Session, meeting_id: int) -> list[Topic]:
    _ensure_meeting_exists(db, meeting_id)
    return meeting_repository.get_topics(db, meeting_id)

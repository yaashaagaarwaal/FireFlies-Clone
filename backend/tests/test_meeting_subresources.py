from datetime import datetime

from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.summary import Summary
from app.models.topic import Topic
from app.models.transcript import TranscriptSegment
from app.models.user import User


def _seed_full_meeting(db_session):
    user = User(name="Host", email="host@example.com")
    speaker = Participant(name="Speaker One", email="speaker@example.com")
    db_session.add_all([user, speaker])
    db_session.flush()

    meeting = Meeting(
        user_id=user.id,
        title="Deep Dive",
        date=datetime(2026, 9, 1, 10, 0),
        duration_seconds=120,
    )
    db_session.add(meeting)
    db_session.flush()

    # Inserted out of order on purpose — the API must return them by
    # order_index, not insertion order.
    db_session.add_all(
        [
            TranscriptSegment(
                meeting_id=meeting.id, speaker_id=speaker.id,
                start_time_sec=5, end_time_sec=10, text="Hello everyone", order_index=1,
            ),
            TranscriptSegment(
                meeting_id=meeting.id, speaker_id=speaker.id,
                start_time_sec=0, end_time_sec=5, text="Let's begin", order_index=0,
            ),
        ]
    )
    db_session.add(Summary(meeting_id=meeting.id, overview_text="A deep dive into the roadmap."))
    db_session.add(Topic(meeting_id=meeting.id, title="Kickoff", order_index=0))
    db_session.commit()
    db_session.refresh(meeting)
    return meeting


def test_get_transcript_returns_segments_in_order(client, db_session):
    meeting = _seed_full_meeting(db_session)

    response = client.get(f"/api/meetings/{meeting.id}/transcript")
    assert response.status_code == 200
    texts = [seg["text"] for seg in response.json()]
    assert texts == ["Let's begin", "Hello everyone"]


def test_get_transcript_for_missing_meeting_returns_404(client):
    assert client.get("/api/meetings/9999/transcript").status_code == 404


def test_get_summary(client, db_session):
    meeting = _seed_full_meeting(db_session)
    response = client.get(f"/api/meetings/{meeting.id}/summary")
    assert response.status_code == 200
    assert response.json()["overview_text"] == "A deep dive into the roadmap."


def test_get_summary_missing_returns_404(client):
    created = client.post(
        "/api/meetings", json={"title": "No Summary Yet", "date": "2026-09-01T10:00:00Z"}
    ).json()

    response = client.get(f"/api/meetings/{created['id']}/summary")
    assert response.status_code == 404


def test_get_summary_for_missing_meeting_returns_404(client):
    assert client.get("/api/meetings/9999/summary").status_code == 404


def test_get_topics(client, db_session):
    meeting = _seed_full_meeting(db_session)
    response = client.get(f"/api/meetings/{meeting.id}/topics")
    assert response.status_code == 200
    assert [t["title"] for t in response.json()] == ["Kickoff"]


def test_get_topics_for_missing_meeting_returns_404(client):
    assert client.get("/api/meetings/9999/topics").status_code == 404

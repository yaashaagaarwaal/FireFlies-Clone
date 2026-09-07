from app.models.participant import Participant


def _create_participant(db_session, name="Priya Nair", email="priya@example.com"):
    participant = Participant(name=name, email=email, avatar_color="#10B981")
    db_session.add(participant)
    db_session.commit()
    db_session.refresh(participant)
    return participant


PLAIN_TRANSCRIPT = (
    "[00:00] Priya Nair: Let's kick off the sprint planning.\n"
    "[00:08] Sam: Sounds good, I'll take the search indexing ticket.\n"
    "[00:15] Priya Nair: Great, I'll review the PR once it's up.\n"
    "[00:22] Sam: I'll also flag the migration risk in the standup notes.\n"
)


def test_create_meeting_with_transcript_generates_everything(client, db_session):
    priya = _create_participant(db_session, name="Priya Nair", email="priya@example.com")

    response = client.post(
        "/api/meetings",
        json={
            "title": "Sprint Planning",
            "date": "2026-09-01T10:00:00Z",
            "participant_ids": [priya.id],
            "transcript_text": PLAIN_TRANSCRIPT,
        },
    )
    assert response.status_code == 201
    meeting = response.json()

    # Segments created in order, with real timestamps.
    segments = meeting["transcript_segments"]
    assert len(segments) == 4
    assert segments[0]["text"] == "Let's kick off the sprint planning."
    assert segments[0]["start_time_sec"] == 0
    assert segments[1]["start_time_sec"] == 8

    # "Priya" in the transcript linked to the already-selected participant,
    # not duplicated.
    assert segments[0]["speaker"]["id"] == priya.id
    assert segments[2]["speaker"]["id"] == priya.id

    # "Sam" didn't exist yet — auto-created and folded into attendees.
    speaker_names = {segment["speaker"]["name"] for segment in segments}
    assert speaker_names == {"Priya Nair", "Sam"}
    participant_names = {p["name"] for p in meeting["participants"]}
    assert participant_names == {"Priya Nair", "Sam"}

    # A summary and topics were generated (heuristic, since no
    # ANTHROPIC_API_KEY is configured in tests); no action items yet.
    assert meeting["summary"] is not None
    assert "Priya Nair" in meeting["summary"]["overview_text"]
    assert "Sam" in meeting["summary"]["overview_text"]
    assert len(meeting["topics"]) > 0
    assert meeting["action_items"] == []

    # Duration inferred from the transcript when none was supplied.
    assert meeting["duration_seconds"] > 22


def test_create_meeting_reuses_existing_participant_by_name_even_if_not_selected(client, db_session):
    _create_participant(db_session, name="Sam", email="sam@example.com")

    response = client.post(
        "/api/meetings",
        json={
            "title": "Standup",
            "date": "2026-09-01T10:00:00Z",
            "transcript_text": "[00:00] Sam: Quick update from me.",
        },
    )
    assert response.status_code == 201
    meeting = response.json()

    assert len(meeting["participants"]) == 1
    # Reused the existing "Sam" row rather than creating a second one.
    assert meeting["participants"][0]["email"] == "sam@example.com"


def test_create_meeting_with_malformed_transcript_returns_400(client):
    response = client.post(
        "/api/meetings",
        json={
            "title": "Bad Transcript",
            "date": "2026-09-01T10:00:00Z",
            "transcript_text": "just some prose, no timestamps or speakers",
        },
    )
    assert response.status_code == 400
    assert "format" in response.json()["detail"].lower()


def test_create_meeting_with_blank_transcript_is_treated_as_no_transcript(client):
    response = client.post(
        "/api/meetings",
        json={"title": "No Transcript Yet", "date": "2026-09-01T10:00:00Z", "transcript_text": "   "},
    )
    assert response.status_code == 201
    meeting = response.json()
    assert meeting["transcript_segments"] == []
    assert meeting["summary"] is None
    assert meeting["topics"] == []


def test_create_meeting_with_vtt_transcript(client):
    vtt = (
        "WEBVTT\n\n"
        "1\n"
        "00:00:00.000 --> 00:00:04.000\n"
        "Jordan: Thanks for hopping on the call.\n"
    )
    response = client.post(
        "/api/meetings",
        json={"title": "VTT Import", "date": "2026-09-01T10:00:00Z", "transcript_text": vtt},
    )
    assert response.status_code == 201
    meeting = response.json()
    assert len(meeting["transcript_segments"]) == 1
    assert meeting["transcript_segments"][0]["speaker"]["name"] == "Jordan"


def test_create_meeting_with_json_transcript(client):
    payload = '[{"speaker": "Devon", "start": 0, "end": 5, "text": "Kicking off."}]'
    response = client.post(
        "/api/meetings",
        json={"title": "JSON Import", "date": "2026-09-01T10:00:00Z", "transcript_text": payload},
    )
    assert response.status_code == 201
    meeting = response.json()
    assert meeting["transcript_segments"][0]["speaker"]["name"] == "Devon"
    assert meeting["duration_seconds"] >= 5

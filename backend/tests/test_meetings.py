from app.models.participant import Participant


def _create_participant(db_session, name="Ada Lovelace", email="ada@example.com"):
    participant = Participant(name=name, email=email, avatar_color="#123456")
    db_session.add(participant)
    db_session.commit()
    db_session.refresh(participant)
    return participant


def test_create_and_list_meeting(client):
    create_response = client.post(
        "/api/meetings",
        json={"title": "Test Sync", "date": "2026-09-01T10:00:00Z", "duration_seconds": 300},
    )
    assert create_response.status_code == 201
    meeting = create_response.json()
    assert meeting["title"] == "Test Sync"
    assert meeting["transcript_segments"] == []
    assert meeting["participants"] == []

    list_response = client.get("/api/meetings")
    assert list_response.status_code == 200
    titles = [m["title"] for m in list_response.json()]
    assert "Test Sync" in titles


def test_create_meeting_rejects_blank_title(client):
    response = client.post("/api/meetings", json={"title": "", "date": "2026-09-01T10:00:00Z"})
    assert response.status_code == 422


def test_create_meeting_rejects_negative_duration(client):
    response = client.post(
        "/api/meetings", json={"title": "X", "date": "2026-09-01T10:00:00Z", "duration_seconds": -5}
    )
    assert response.status_code == 422


def test_create_meeting_with_unknown_participant_returns_400(client):
    response = client.post(
        "/api/meetings",
        json={"title": "X", "date": "2026-09-01T10:00:00Z", "participant_ids": [999]},
    )
    assert response.status_code == 400
    assert "999" in response.json()["detail"]


def test_get_missing_meeting_returns_404(client):
    response = client.get("/api/meetings/9999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_full_replace_and_delete_meeting(client, db_session):
    participant = _create_participant(db_session)

    created = client.post(
        "/api/meetings", json={"title": "Old Title", "date": "2026-09-01T10:00:00Z"}
    ).json()

    replaced = client.put(
        f"/api/meetings/{created['id']}",
        json={
            "title": "New Title",
            "date": "2026-09-02T10:00:00Z",
            "duration_seconds": 120,
            "participant_ids": [participant.id],
        },
    )
    assert replaced.status_code == 200
    body = replaced.json()
    assert body["title"] == "New Title"
    assert body["duration_seconds"] == 120
    assert [p["id"] for p in body["participants"]] == [participant.id]

    deleted = client.delete(f"/api/meetings/{created['id']}")
    assert deleted.status_code == 204
    assert client.get(f"/api/meetings/{created['id']}").status_code == 404


def test_update_missing_meeting_returns_404(client):
    response = client.put("/api/meetings/9999", json={"title": "X", "date": "2026-09-01T10:00:00Z"})
    assert response.status_code == 404


def test_delete_missing_meeting_returns_404(client):
    assert client.delete("/api/meetings/9999").status_code == 404


def test_search_filter_by_title_and_participant(client, db_session):
    participant = _create_participant(db_session, name="Grace Hopper", email="grace@example.com")

    client.post("/api/meetings", json={"title": "Marketing Sync", "date": "2026-09-01T10:00:00Z"})
    client.post(
        "/api/meetings",
        json={
            "title": "Engineering Standup",
            "date": "2026-09-02T10:00:00Z",
            "participant_ids": [participant.id],
        },
    )

    by_title = client.get("/api/meetings", params={"search": "Marketing"}).json()
    assert [m["title"] for m in by_title] == ["Marketing Sync"]

    by_participant = client.get("/api/meetings", params={"participant": "Grace"}).json()
    assert [m["title"] for m in by_participant] == ["Engineering Standup"]


def test_filter_by_date(client):
    client.post("/api/meetings", json={"title": "Day One", "date": "2026-09-01T09:00:00Z"})
    client.post("/api/meetings", json={"title": "Day Two", "date": "2026-09-02T09:00:00Z"})

    response = client.get("/api/meetings", params={"date": "2026-09-02"})
    assert [m["title"] for m in response.json()] == ["Day Two"]


def test_sort_by_title(client):
    client.post("/api/meetings", json={"title": "Zeta", "date": "2026-09-01T09:00:00Z"})
    client.post("/api/meetings", json={"title": "Alpha", "date": "2026-09-02T09:00:00Z"})

    response = client.get("/api/meetings", params={"sort": "title"})
    assert [m["title"] for m in response.json()] == ["Alpha", "Zeta"]


def test_sort_by_recency_is_default(client):
    client.post("/api/meetings", json={"title": "Earlier", "date": "2026-09-01T09:00:00Z"})
    client.post("/api/meetings", json={"title": "Later", "date": "2026-09-05T09:00:00Z"})

    response = client.get("/api/meetings")
    assert [m["title"] for m in response.json()] == ["Later", "Earlier"]

from app.models.action_item import ActionItem
from app.models.participant import Participant


def _create_meeting(client, title="Standup"):
    return client.post("/api/meetings", json={"title": title, "date": "2026-09-01T10:00:00Z"}).json()


def _create_participant(db_session, name="Dana Scully", email="dana@example.com"):
    participant = Participant(name=name, email=email)
    db_session.add(participant)
    db_session.commit()
    db_session.refresh(participant)
    return participant


def test_create_list_update_delete_action_item(client, db_session):
    meeting = _create_meeting(client)
    assignee = _create_participant(db_session)

    created = client.post(
        f"/api/meetings/{meeting['id']}/action-items",
        json={
            "text": "Follow up with design",
            "assignee_id": assignee.id,
            "due_date": "2026-09-05T00:00:00Z",
        },
    )
    assert created.status_code == 201
    item = created.json()
    assert item["text"] == "Follow up with design"
    assert item["is_complete"] is False
    assert item["assignee"]["id"] == assignee.id

    listed = client.get(f"/api/meetings/{meeting['id']}/action-items")
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    updated = client.put(
        f"/api/action-items/{item['id']}",
        json={"text": "Follow up with design team", "assignee_id": assignee.id, "is_complete": True},
    )
    assert updated.status_code == 200
    assert updated.json()["is_complete"] is True
    assert updated.json()["text"] == "Follow up with design team"

    deleted = client.delete(f"/api/action-items/{item['id']}")
    assert deleted.status_code == 204
    assert client.get(f"/api/meetings/{meeting['id']}/action-items").json() == []


def test_list_action_items_for_missing_meeting_returns_404(client):
    assert client.get("/api/meetings/9999/action-items").status_code == 404


def test_create_action_item_for_missing_meeting_returns_404(client):
    response = client.post("/api/meetings/9999/action-items", json={"text": "Do something"})
    assert response.status_code == 404


def test_create_action_item_with_unknown_assignee_returns_400(client):
    meeting = _create_meeting(client)
    response = client.post(
        f"/api/meetings/{meeting['id']}/action-items",
        json={"text": "Do something", "assignee_id": 999},
    )
    assert response.status_code == 400


def test_create_action_item_rejects_blank_text(client):
    meeting = _create_meeting(client)
    response = client.post(f"/api/meetings/{meeting['id']}/action-items", json={"text": ""})
    assert response.status_code == 422


def test_update_missing_action_item_returns_404(client):
    response = client.put("/api/action-items/9999", json={"text": "X", "is_complete": False})
    assert response.status_code == 404


def test_delete_missing_action_item_returns_404(client):
    assert client.delete("/api/action-items/9999").status_code == 404


def test_deleting_meeting_cascades_to_its_action_items(client, db_session):
    meeting = _create_meeting(client)
    assignee = _create_participant(db_session)
    client.post(
        f"/api/meetings/{meeting['id']}/action-items", json={"text": "Task", "assignee_id": assignee.id}
    )

    assert client.delete(f"/api/meetings/{meeting['id']}").status_code == 204

    remaining = db_session.query(ActionItem).filter_by(meeting_id=meeting["id"]).all()
    assert remaining == []

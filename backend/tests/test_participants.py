from app.models.participant import Participant


def test_list_participants_ordered_by_name(client, db_session):
    db_session.add_all(
        [
            Participant(name="Bob Smith", email="bob@example.com"),
            Participant(name="Amy Chen", email="amy@example.com"),
        ]
    )
    db_session.commit()

    response = client.get("/api/participants")
    assert response.status_code == 200
    assert [p["name"] for p in response.json()] == ["Amy Chen", "Bob Smith"]

"""Business logic for action items."""
from sqlalchemy.orm import Session

from app.exceptions import InvalidInputError, NotFoundError
from app.models.action_item import ActionItem
from app.repositories import action_item_repository, meeting_repository, participant_repository
from app.schemas.action_item import ActionItemCreate, ActionItemUpdate


def _ensure_meeting_exists(db: Session, meeting_id: int) -> None:
    if meeting_repository.get_by_id(db, meeting_id) is None:
        raise NotFoundError("Meeting", meeting_id)


def _validate_assignee(db: Session, assignee_id: int | None) -> None:
    if assignee_id is not None and participant_repository.get_by_id(db, assignee_id) is None:
        raise InvalidInputError(f"Unknown assignee_id: {assignee_id}")


def list_for_meeting(db: Session, meeting_id: int) -> list[ActionItem]:
    _ensure_meeting_exists(db, meeting_id)
    return action_item_repository.list_for_meeting(db, meeting_id)


def create_action_item(db: Session, meeting_id: int, payload: ActionItemCreate) -> ActionItem:
    _ensure_meeting_exists(db, meeting_id)
    _validate_assignee(db, payload.assignee_id)

    item = ActionItem(
        meeting_id=meeting_id,
        text=payload.text,
        assignee_id=payload.assignee_id,
        due_date=payload.due_date,
    )
    return action_item_repository.create(db, item)


def get_action_item(db: Session, action_item_id: int) -> ActionItem:
    item = action_item_repository.get_by_id(db, action_item_id)
    if item is None:
        raise NotFoundError("ActionItem", action_item_id)
    return item


def update_action_item(db: Session, action_item_id: int, payload: ActionItemUpdate) -> ActionItem:
    """Full replace (PUT): every field on the item is overwritten from the
    payload, including is_complete — there's no partial-field semantics.
    """
    item = get_action_item(db, action_item_id)
    _validate_assignee(db, payload.assignee_id)

    item.text = payload.text
    item.assignee_id = payload.assignee_id
    item.due_date = payload.due_date
    item.is_complete = payload.is_complete

    return action_item_repository.save(db, item)


def delete_action_item(db: Session, action_item_id: int) -> None:
    item = get_action_item(db, action_item_id)
    action_item_repository.delete(db, item)

"""Data access for ActionItem."""
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.action_item import ActionItem

LOAD_OPTIONS = (selectinload(ActionItem.assignee),)


def get_by_id(db: Session, action_item_id: int) -> ActionItem | None:
    stmt = select(ActionItem).where(ActionItem.id == action_item_id).options(*LOAD_OPTIONS)
    return db.scalars(stmt).first()


def list_for_meeting(db: Session, meeting_id: int) -> list[ActionItem]:
    stmt = (
        select(ActionItem)
        .where(ActionItem.meeting_id == meeting_id)
        .options(*LOAD_OPTIONS)
        .order_by(ActionItem.created_at)
    )
    return list(db.scalars(stmt))


def create(db: Session, action_item: ActionItem) -> ActionItem:
    db.add(action_item)
    db.commit()
    db.refresh(action_item)
    return action_item


def save(db: Session, action_item: ActionItem) -> ActionItem:
    db.commit()
    db.refresh(action_item)
    return action_item


def delete(db: Session, action_item: ActionItem) -> None:
    db.delete(action_item)
    db.commit()

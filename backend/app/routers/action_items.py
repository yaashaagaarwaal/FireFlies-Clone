from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.action_item import ActionItem
from app.schemas.action_item import ActionItemCreate, ActionItemRead, ActionItemUpdate
from app.services import action_item_service

router = APIRouter(tags=["action-items"])


@router.get("/api/meetings/{meeting_id}/action-items", response_model=list[ActionItemRead])
def list_action_items(meeting_id: int, db: Session = Depends(get_db)) -> list[ActionItem]:
    return action_item_service.list_for_meeting(db, meeting_id)


@router.post("/api/meetings/{meeting_id}/action-items", response_model=ActionItemRead, status_code=201)
def create_action_item(meeting_id: int, payload: ActionItemCreate, db: Session = Depends(get_db)) -> ActionItem:
    return action_item_service.create_action_item(db, meeting_id, payload)


@router.put("/api/action-items/{action_item_id}", response_model=ActionItemRead)
def update_action_item(action_item_id: int, payload: ActionItemUpdate, db: Session = Depends(get_db)) -> ActionItem:
    return action_item_service.update_action_item(db, action_item_id, payload)


@router.delete("/api/action-items/{action_item_id}", status_code=204)
def delete_action_item(action_item_id: int, db: Session = Depends(get_db)) -> None:
    action_item_service.delete_action_item(db, action_item_id)

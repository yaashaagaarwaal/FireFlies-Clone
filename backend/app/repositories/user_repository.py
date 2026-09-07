"""Data access for User. The app has no real auth (per assignment scope), so
this only ever deals with a single default user.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_default_user(db: Session) -> User:
    user = db.scalars(select(User)).first()
    if user is None:
        # Fallback for a freshly-created (unseeded) database.
        user = User(name="Yash Agarwal", email="yash21chess@gmail.com")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

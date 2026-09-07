from datetime import datetime, timezone

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    avatar_color: Mapped[str] = mapped_column(String(20), default="#6D5EF8")
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

    meetings: Mapped[list["Meeting"]] = relationship(back_populates="user", cascade="all, delete-orphan")

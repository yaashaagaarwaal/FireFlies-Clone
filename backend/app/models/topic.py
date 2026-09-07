from sqlalchemy import Float, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Topic(Base):
    """A chapter/key-topic within a meeting (many per meeting). order_index
    drives display order; start_time_sec is optional so a topic can double
    as a "jump to this point in the transcript" chapter marker.
    """

    __tablename__ = "topics"
    __table_args__ = (Index("ix_topics_meeting_order", "meeting_id", "order_index"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(255))
    order_index: Mapped[int] = mapped_column(Integer)
    start_time_sec: Mapped[float | None] = mapped_column(Float, nullable=True)

    meeting: Mapped["Meeting"] = relationship(back_populates="topics")

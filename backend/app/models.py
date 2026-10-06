from datetime import datetime
from sqlalchemy import (
    Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer,
    String, Text, event
)
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


# Enable foreign keys for every SQLite connection
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    meetings: Mapped[list["Meeting"]] = relationship("Meeting", back_populates="host")
    participations: Mapped[list["Participant"]] = relationship(
        "Participant", back_populates="user"
    )


class Meeting(Base):
    __tablename__ = "meetings"
    __table_args__ = (
        CheckConstraint("type IN ('instant', 'scheduled')", name="ck_meeting_type"),
        CheckConstraint(
            "status IN ('scheduled', 'live', 'ended')", name="ck_meeting_status"
        ),
        CheckConstraint("duration_min > 0", name="ck_duration_positive"),
        Index("ix_meetings_code", "meeting_code"),
        Index("ix_meetings_scheduled_start", "scheduled_start"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meeting_code: Mapped[str] = mapped_column(String(11), unique=True, nullable=False)
    host_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # instant|scheduled
    scheduled_start: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_min: Mapped[int] = mapped_column(Integer, nullable=False, default=60)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="scheduled"
    )  # scheduled|live|ended
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    host: Mapped["User"] = relationship("User", back_populates="meetings")
    participants: Mapped[list["Participant"]] = relationship(
        "Participant", back_populates="meeting", cascade="all, delete-orphan"
    )


class Participant(Base):
    __tablename__ = "participants"
    __table_args__ = (
        CheckConstraint(
            "role IN ('host', 'participant')", name="ck_participant_role"
        ),
        CheckConstraint(
            "status IN ('joined', 'left', 'removed')", name="ck_participant_status"
        ),
        Index("ix_participants_meeting_id", "meeting_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meeting_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("meetings.id"), nullable=False
    )
    user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="participant")
    is_muted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_video_off: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="joined"
    )  # joined|left|removed
    joined_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    left_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="participants")
    user: Mapped["User | None"] = relationship("User", back_populates="participations")

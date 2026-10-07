from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


# ---------- User ----------

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------- Participant ----------

class ParticipantOut(BaseModel):
    id: int
    meeting_id: int
    user_id: Optional[int]
    display_name: str
    role: str
    is_muted: bool
    is_video_off: bool
    status: str
    joined_at: datetime
    left_at: Optional[datetime]

    model_config = {"from_attributes": True}


class ParticipantPatch(BaseModel):
    is_muted: Optional[bool] = None
    is_video_off: Optional[bool] = None


# ---------- Meeting ----------

class MeetingOut(BaseModel):
    id: int
    meeting_code: str
    host_id: int
    title: str
    description: Optional[str]
    type: str
    scheduled_start: Optional[datetime]
    duration_min: int
    status: str
    created_at: datetime
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    formatted_id: Optional[str] = None
    join_url: Optional[str] = None

    model_config = {"from_attributes": True}


class MeetingWithParticipants(MeetingOut):
    participants: list[ParticipantOut] = []


class InstantMeetingBody(BaseModel):
    title: Optional[str] = None


class ScheduleMeetingBody(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_start: datetime  # ISO UTC
    duration_min: int

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("title must not be empty")
        return v.strip()

    @field_validator("duration_min")
    @classmethod
    def duration_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("duration_min must be greater than 0")
        return v


class PatchMeetingBody(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    duration_min: Optional[int] = None


class JoinBody(BaseModel):
    display_name: str
    is_host: Optional[bool] = False

    @field_validator("display_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("display_name must not be empty after trim")
        return v.strip()


class LeaveBody(BaseModel):
    participant_id: int


class JoinResponse(BaseModel):
    participant: ParticipantOut
    meeting: MeetingOut

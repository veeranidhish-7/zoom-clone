import random
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Meeting, Participant, User
from ..schemas import (
    InstantMeetingBody,
    JoinBody,
    JoinResponse,
    LeaveBody,
    MeetingOut,
    ParticipantOut,
    ParticipantPatch,
    PatchMeetingBody,
    ScheduleMeetingBody,
)
from ..utils import (
    build_join_url,
    format_meeting_id,
    generate_meeting_code,
    normalize_code,
)

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

MOCK_NAMES = [
    "Priya Sharma",
    "Rahul Verma",
    "Sneha Iyer",
    "Karthik Rao",
    "Meera Nair",
]


# ── helpers ────────────────────────────────────────────────────────────────

def _enrich(m: Meeting) -> MeetingOut:
    """Attach computed fields to a meeting."""
    out = MeetingOut.model_validate(m)
    out.formatted_id = format_meeting_id(m.meeting_code)
    out.join_url = build_join_url(m.meeting_code)
    return out


def _get_meeting_by_raw_code(raw: str, db: Session) -> Meeting:
    """Resolve raw input to a Meeting, raising 404/410 as needed."""
    code = normalize_code(raw)
    if not code:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting = db.query(Meeting).filter(Meeting.meeting_code == code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.status == "ended":
        raise HTTPException(status_code=410, detail="Meeting has ended")
    return meeting


# ══════════════════════════════════════════════════════════════════════════════
# FIXED routes (no dynamic code segment) – must come BEFORE dynamic routes
# ══════════════════════════════════════════════════════════════════════════════

# ── POST /api/meetings/instant ─────────────────────────────────────────────

@router.post("/instant", response_model=MeetingOut, status_code=201)
def create_instant_meeting(
    body: InstantMeetingBody = InstantMeetingBody(),
    db: Session = Depends(get_db),
):
    title = (body.title or "").strip() or "Instant Meeting"
    code = generate_meeting_code()
    meeting = Meeting(
        meeting_code=code,
        host_id=1,
        title=title,
        type="instant",
        duration_min=60,
        status="scheduled",
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return _enrich(meeting)


# ── POST /api/meetings ─────────────────────────────────────────────────────

@router.post("", response_model=MeetingOut, status_code=201)
def schedule_meeting(
    body: ScheduleMeetingBody,
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    start = body.scheduled_start
    if start.tzinfo is not None:
        from datetime import timezone
        start = start.astimezone(timezone.utc).replace(tzinfo=None)
    if start <= now:
        raise HTTPException(
            status_code=422, detail="scheduled_start must be in the future"
        )

    code = generate_meeting_code()
    meeting = Meeting(
        meeting_code=code,
        host_id=1,
        title=body.title.strip(),
        description=body.description,
        type="scheduled",
        scheduled_start=start,
        duration_min=body.duration_min,
        status="scheduled",
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return _enrich(meeting)


# ── GET /api/meetings/upcoming ─────────────────────────────────────────────

@router.get("/upcoming", response_model=list[MeetingOut])
def get_upcoming(db: Session = Depends(get_db)):
    meetings = (
        db.query(Meeting)
        .filter(Meeting.status.in_(["scheduled", "live"]))
        .order_by(Meeting.scheduled_start.asc())
        .all()
    )
    return [_enrich(m) for m in meetings]


# ── GET /api/meetings/recent ───────────────────────────────────────────────

@router.get("/recent", response_model=list[MeetingOut])
def get_recent(db: Session = Depends(get_db)):
    meetings = (
        db.query(Meeting)
        .filter(Meeting.status == "ended")
        .order_by(Meeting.ended_at.desc())
        .all()
    )
    return [_enrich(m) for m in meetings]


# ══════════════════════════════════════════════════════════════════════════════
# SUB-RESOURCE routes  /{code}/xxx  – must come BEFORE /{code:path}
# ══════════════════════════════════════════════════════════════════════════════

# ── POST /api/meetings/{code}/join ─────────────────────────────────────────

@router.post("/{code}/join", response_model=JoinResponse, status_code=201)
def join_meeting(
    code: str,
    body: JoinBody,
    db: Session = Depends(get_db),
):
    normalized = normalize_code(code)
    if not normalized:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting = db.query(Meeting).filter(Meeting.meeting_code == normalized).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.status == "ended":
        raise HTTPException(status_code=410, detail="Meeting has ended")

    display_name = body.display_name  # already stripped by validator

    # Determine role: host if display_name matches host's name
    host = db.query(User).filter(User.id == meeting.host_id).first()
    is_host = host and display_name.lower() == host.name.lower()
    role = "host" if is_host else "participant"
    user_id = host.id if is_host else None

    # On first join: set status -> live and seed 3 mock participants
    active_count = (
        db.query(Participant)
        .filter(
            Participant.meeting_id == meeting.id,
            Participant.status == "joined",
        )
        .count()
    )

    if active_count == 0:
        meeting.status = "live"
        meeting.started_at = datetime.utcnow()
        db.flush()

        mock_names = random.sample(MOCK_NAMES, 3)
        for mname in mock_names:
            mp = Participant(
                meeting_id=meeting.id,
                user_id=None,
                display_name=mname,
                role="participant",
                is_muted=random.choice([True, False]),
                is_video_off=random.choice([True, False]),
                status="joined",
                joined_at=datetime.utcnow(),
            )
            db.add(mp)
        db.flush()

    participant = Participant(
        meeting_id=meeting.id,
        user_id=user_id,
        display_name=display_name,
        role=role,
        is_muted=False,
        is_video_off=False,
        status="joined",
        joined_at=datetime.utcnow(),
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    db.refresh(meeting)

    return JoinResponse(
        participant=ParticipantOut.model_validate(participant),
        meeting=_enrich(meeting),
    )


# ── POST /api/meetings/{code}/leave ────────────────────────────────────────

@router.post("/{code}/leave", status_code=200)
def leave_meeting(
    code: str,
    body: LeaveBody,
    db: Session = Depends(get_db),
):
    normalized = normalize_code(code)
    if not normalized:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting = db.query(Meeting).filter(Meeting.meeting_code == normalized).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    participant = (
        db.query(Participant)
        .filter(
            Participant.id == body.participant_id,
            Participant.meeting_id == meeting.id,
        )
        .first()
    )
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    now = datetime.utcnow()
    participant.status = "left"
    participant.left_at = now

    if participant.role == "host":
        meeting.status = "ended"
        meeting.ended_at = now
        db.query(Participant).filter(
            Participant.meeting_id == meeting.id,
            Participant.status == "joined",
        ).update({"status": "left", "left_at": now})

    db.commit()
    return {"detail": "ok"}


# ── GET /api/meetings/{code}/participants ──────────────────────────────────

@router.get("/{code}/participants", response_model=list[ParticipantOut])
def get_participants(code: str, db: Session = Depends(get_db)):
    normalized = normalize_code(code)
    if not normalized:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting = db.query(Meeting).filter(Meeting.meeting_code == normalized).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    participants = (
        db.query(Participant)
        .filter(
            Participant.meeting_id == meeting.id,
            Participant.status == "joined",
        )
        .all()
    )
    return participants


# ── PATCH /api/meetings/{code}/participants/{pid} ──────────────────────────

@router.patch("/{code}/participants/{pid}", response_model=ParticipantOut)
def patch_participant(
    code: str,
    pid: int,
    body: ParticipantPatch,
    db: Session = Depends(get_db),
):
    normalized = normalize_code(code)
    if not normalized:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting = db.query(Meeting).filter(Meeting.meeting_code == normalized).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    participant = (
        db.query(Participant)
        .filter(Participant.id == pid, Participant.meeting_id == meeting.id)
        .first()
    )
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    if body.is_muted is not None:
        participant.is_muted = body.is_muted
    if body.is_video_off is not None:
        participant.is_video_off = body.is_video_off
    db.commit()
    db.refresh(participant)
    return participant


# ── POST /api/meetings/{code}/mute-all ────────────────────────────────────

@router.post("/{code}/mute-all", status_code=200)
def mute_all(
    code: str,
    request: Request,
    db: Session = Depends(get_db),
    x_participant_id: Optional[str] = Header(None),
):
    normalized = normalize_code(code)
    if not normalized:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting = db.query(Meeting).filter(Meeting.meeting_code == normalized).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    pid_raw = x_participant_id or request.query_params.get("participant_id")
    if not pid_raw:
        raise HTTPException(
            status_code=403,
            detail="participant_id is required (X-Participant-Id header or query param)",
        )
    try:
        caller_id = int(pid_raw)
    except ValueError:
        raise HTTPException(status_code=403, detail="Invalid participant_id")

    caller = (
        db.query(Participant)
        .filter(Participant.id == caller_id, Participant.meeting_id == meeting.id)
        .first()
    )
    if not caller:
        raise HTTPException(status_code=404, detail="Participant not found")
    if caller.role != "host":
        raise HTTPException(status_code=403, detail="Only the host can mute all")

    db.query(Participant).filter(
        Participant.meeting_id == meeting.id,
        Participant.status == "joined",
        Participant.id != caller_id,
    ).update({"is_muted": True})
    db.commit()
    return {"detail": "all muted"}


# ── DELETE /api/meetings/{code}/participants/{pid} ─────────────────────────

@router.delete("/{code}/participants/{pid}", status_code=204)
def remove_participant(
    code: str,
    pid: int,
    request: Request,
    db: Session = Depends(get_db),
    x_participant_id: Optional[str] = Header(None),
):
    normalized = normalize_code(code)
    if not normalized:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting = db.query(Meeting).filter(Meeting.meeting_code == normalized).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    pid_raw = x_participant_id or request.query_params.get("participant_id")
    if not pid_raw:
        raise HTTPException(status_code=403, detail="participant_id required")
    try:
        caller_id = int(pid_raw)
    except ValueError:
        raise HTTPException(status_code=403, detail="Invalid participant_id")

    caller = (
        db.query(Participant)
        .filter(Participant.id == caller_id, Participant.meeting_id == meeting.id)
        .first()
    )
    if not caller or caller.role != "host":
        raise HTTPException(
            status_code=403, detail="Only the host can remove participants"
        )

    target = (
        db.query(Participant)
        .filter(Participant.id == pid, Participant.meeting_id == meeting.id)
        .first()
    )
    if not target:
        raise HTTPException(status_code=404, detail="Participant not found")

    target.status = "removed"
    target.left_at = datetime.utcnow()
    db.commit()


# ══════════════════════════════════════════════════════════════════════════════
# GENERIC /{code:path} routes – MUST come LAST so they don't shadow sub-routes
# ══════════════════════════════════════════════════════════════════════════════

# ── GET /api/meetings/{code} ───────────────────────────────────────────────

@router.get("/{code:path}", response_model=MeetingOut)
def get_meeting(code: str, db: Session = Depends(get_db)):
    """
    Accepts:
      - 11-digit code: 65045918333
      - Spaced format: 650 4591 8333
      - Full invite link: http://localhost:3000/j/65045918333?pwd=abc
    """
    meeting = _get_meeting_by_raw_code(code, db)
    return _enrich(meeting)


# ── PATCH /api/meetings/{code} ─────────────────────────────────────────────

@router.patch("/{code:path}", response_model=MeetingOut)
def patch_meeting(
    code: str,
    body: PatchMeetingBody,
    db: Session = Depends(get_db),
):
    meeting = _get_meeting_by_raw_code(code, db)
    if body.title is not None:
        t = body.title.strip()
        if not t:
            raise HTTPException(status_code=422, detail="title must not be empty")
        meeting.title = t
    if body.description is not None:
        meeting.description = body.description
    if body.scheduled_start is not None:
        start = body.scheduled_start
        if start.tzinfo is not None:
            from datetime import timezone
            start = start.astimezone(timezone.utc).replace(tzinfo=None)
        meeting.scheduled_start = start
    if body.duration_min is not None:
        if body.duration_min <= 0:
            raise HTTPException(
                status_code=422, detail="duration_min must be greater than 0"
            )
        meeting.duration_min = body.duration_min
    db.commit()
    db.refresh(meeting)
    return _enrich(meeting)


# ── DELETE /api/meetings/{code} ────────────────────────────────────────────

@router.delete("/{code:path}", status_code=204)
def delete_meeting(
    code: str,
    db: Session = Depends(get_db),
):
    meeting = _get_meeting_by_raw_code(code, db)
    db.delete(meeting)
    db.commit()

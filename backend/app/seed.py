from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from .models import Meeting, Participant, User
from .utils import generate_meeting_code, build_join_url, format_meeting_id

MOCK_NAMES = [
    "Priya Sharma",
    "Rahul Verma",
    "Sneha Iyer",
    "Karthik Rao",
    "Meera Nair",
]


def seed_database(db: Session) -> None:
    """Seed the database only if it is empty (no users)."""
    if db.query(User).count() > 0:
        return

    now = datetime.utcnow()

    # ── 1 user ──────────────────────────────────────────────────────────────
    anirudh = User(name="Anirudh", email="anirudh@example.com")
    db.add(anirudh)
    db.flush()  # get anirudh.id

    # ── 4 upcoming scheduled meetings ───────────────────────────────────────
    upcoming_specs = [
        ("Team Sync – Sprint 23 Planning", now + timedelta(days=1)),
        ("Product Roadmap Review Q4", now + timedelta(days=2)),
        ("Design Handoff – Landing Page v2", now + timedelta(days=4)),
        ("All-Hands: Company OKR Update", now + timedelta(weeks=1)),
    ]

    for title, start in upcoming_specs:
        code = generate_meeting_code()
        m = Meeting(
            meeting_code=code,
            host_id=anirudh.id,
            title=title,
            type="scheduled",
            scheduled_start=start,
            duration_min=60,
            status="scheduled",
        )
        db.add(m)

    db.flush()

    # ── 5 ended meetings with participants ──────────────────────────────────
    ended_specs = [
        ("Weekly Standup", now - timedelta(days=1), 45, 2),
        ("Frontend Architecture Review", now - timedelta(days=3), 90, 3),
        ("Customer Demo – Acme Corp", now - timedelta(days=5), 30, 4),
        ("Retrospective Sprint 22", now - timedelta(days=8), 60, 2),
        ("Investor Update Call", now - timedelta(days=12), 45, 3),
    ]

    import random

    for title, start, dur, n_participants in ended_specs:
        code = generate_meeting_code()
        m = Meeting(
            meeting_code=code,
            host_id=anirudh.id,
            title=title,
            type="scheduled",
            scheduled_start=start,
            duration_min=dur,
            status="ended",
            started_at=start,
            ended_at=start + timedelta(minutes=dur),
        )
        db.add(m)
        db.flush()

        # Host participant
        host_p = Participant(
            meeting_id=m.id,
            user_id=anirudh.id,
            display_name=anirudh.name,
            role="host",
            is_muted=False,
            is_video_off=False,
            status="left",
            joined_at=start,
            left_at=start + timedelta(minutes=dur),
        )
        db.add(host_p)

        # Mock participants
        names = random.sample(MOCK_NAMES, min(n_participants, len(MOCK_NAMES)))
        for name in names:
            p = Participant(
                meeting_id=m.id,
                user_id=None,
                display_name=name,
                role="participant",
                is_muted=random.choice([True, False]),
                is_video_off=random.choice([True, False]),
                status="left",
                joined_at=start + timedelta(minutes=random.randint(0, 5)),
                left_at=start + timedelta(minutes=dur - random.randint(0, 3)),
            )
            db.add(p)

    db.commit()
    print("✅ Database seeded successfully.")

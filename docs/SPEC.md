# Zoom Clone: SPEC (single source of truth)

Every AI prompt starts with: "Read docs/SPEC.md first. Do not deviate from it."
If the spec and your instinct disagree, the spec wins. If something is missing, ask. Do not invent.

## 0. Stack and layout
- Frontend: Next.js (App Router, TypeScript, Tailwind), `frontend/`
- Backend: FastAPI + SQLAlchemy + SQLite, `backend/`
- No auth. A default user "Anirudh" is treated as logged in (seeded, id=1).
- Frontend talks to the backend only through `frontend/lib/api.ts`. Base URL from `NEXT_PUBLIC_API_URL`.

```
zoom-clone/
  docs/SPEC.md
  backend/app/{main.py,database.py,models.py,schemas.py,seed.py,utils.py,routers/{meetings.py,participants.py,users.py}}
  backend/requirements.txt
  frontend/app/...  frontend/components/...  frontend/lib/{api.ts,format.ts}  frontend/styles/tokens.css
  README.md
```

## 1. Which Zoom are we copying?
Two real UIs exist in the recon. We use BOTH, per screen:
| Screen | Copy this Zoom UI |
|---|---|
| Home dashboard | Workplace web client (narrow icon sidebar, big clock, New meeting / Join / Schedule tiles) |
| Meetings list, Schedule form, Meeting detail | zoom.us website (wide sidebar `#F7F7FA`, tabs, long form) |
| Join dialog | Workplace-style modal with Meeting ID + name |
| Pre-join (camera/mic permission) | Dark dialog "Do you want people to see you in the meeting?" |
| Meeting room | Workplace dark stage, bottom toolbar, side panels |

## 2. Design tokens (`frontend/styles/tokens.css`, CSS variables). Values from the recon file.
```
/* brand */
--blue-button:   #0D6BDE;  /* solid buttons, links */
--blue-tile:     #0E71EB;  /* Workplace Join/Schedule tiles, Admit btn, active tab */
--blue-web-tile: #0D72ED;  /* zoom.us Schedule/Join tiles, Start btn, Schedule a Meeting btn (pixel-only) */
--blue-logo:     #0B5CFF;
--blue-chat:     #4488FF;
--orange-new:    #FF742E;  /* Workplace New meeting tile */
--orange-host:   #F26D20;  /* zoom.us Host tile (pixel-only) */
/* light surfaces */
--sidebar-web:   #F7F7FA;  --sidebar-selected: #F2F8FF;
--sidebar-wp:    #F1F4F6;  --search-fill: #ECEFF1;
--white: #FFFFFF;  --blue-tint: #E7F1FD;  --blue-border: #A8CCF8;
--promo-green:   #E5F7EB;  --icon-pink: #FFF2F5;
--topbar-navy:   #00031F;  --footer: #39394D;
/* text */
--text-body: #222325;  --text-heading: #232333;  --text-nav: #666484;
--text-muted: #6E7680;  --text-label: #686F79;  --text-sidebar: #555B62;
--text-promo: #514F6E;  --text-disabled: #ADB1B8;  --input-border: #747487;
/* dividers */  --divider: #DFE3E8;  --divider-2: #EAEAEA;
/* in-meeting dark (PIXEL-MEASURED, not CSS-confirmed) */
--stage-bg:   #0D0D0D;  --panel-bg: #1D1E20;  --toolbar-bg: #080808;
--panel-divider: #2A2B2D;  /* unconfirmed */
--camoff-tile: #8B8B8B;  --camoff-icon: #D2D2D2;
--avatar-purple: #8F44AD;  --end-red: #FF0055;  --muted-red: #FF6682;
```
Font: UNKNOWN (not in recon). Put it in ONE variable `--font-body` so it is a one-line swap.
Temporary value: `Lato, "Helvetica Neue", Helvetica, Arial, sans-serif`. TODO: replace with real value from Inspect on `<body>`.
Not provided (use sensible defaults and mark TODO): border radii, toolbar button size, tile gaps, shadows.
Defaults: card radius 12px, button radius 8px, tiles 12px, toolbar icon button 48x48.

## 3. Screens and routes
| Route | Screen |
|---|---|
| `/` | Home (Workplace style). Header: back/forward arrows, search bar `#ECEFF1`, profile avatar, settings gear (placeholders). Narrow left sidebar `#F1F4F6`: Home, Chat, Meetings, Contacts (icons + labels, active state). Big clock (e.g. "7:24 PM", `--text-heading`) and date. Three square tiles: New meeting (orange), Join (blue), Schedule (blue). Right/under: Upcoming meetings card and Recent meetings card. Promo-style info box with `#A8CCF8` border is optional. |
| `/meetings` | zoom.us style: wide sidebar `#F7F7FA` (selected row `#F2F8FF`), title "Meetings", tabs Upcoming / Previous (active tab text+underline `--blue-tile`, inactive `--text-muted`), "Schedule a Meeting" button (`--blue-web-tile`), empty state "Welcome to Zoom Meetings!" |
| `/meetings/schedule` | Schedule Meeting form: Topic, Description, When (date + time), Duration (hours + minutes), Time zone (display only), Save (blue) / Cancel. |
| `/meetings/[code]` | Manage meeting detail: tabs Details/Attachments (selected `#E7F1FD`), topic, time, meeting ID, invite link + copy, Start / Edit / Delete buttons. |
| `/j/[code]` | Invite link entry. Validates the code, then goes to pre-join. |
| `/meeting/[code]/join` | Pre-join: name input (prefilled with default user) + dark dialog "Do you want people to see you in the meeting?" with "Use microphone and camera" (blue) and "Continue without microphone and camera". Calls the join API. |
| `/meeting/[code]` | Meeting room, see 3.1 |
| `/meeting/[code]/ended` | "Meeting ended" with a Return to Home button |
Join modal on Home: Meeting ID or invite link input, display name input, Join button disabled until the ID is non-empty (matches the disabled Join button in the recon).

### 3.1 Meeting room (dark, UI only first, mock participants)
- Stage `--stage-bg`. Bottom toolbar `--toolbar-bg`.
- Own video from `getUserMedia`. If the camera is off or denied: grey tile `--camoff-tile` with a `--camoff-icon` camera icon, or an initials avatar (purple `--avatar-purple`).
- Grid layout: 1 tile = full, 2 = side by side, 3-4 = 2x2, 5-9 = 3x3. Each tile shows a name label bottom-left and a muted-mic icon if muted.
- Toolbar (VERIFY against screenshots 10, 11, 12): Audio (mic + caret), Video (camera + caret), Participants (with count), Chat, Share, Reactions, More, and red End button (`--end-red`).
- Top-left: security shield + meeting info and a running timer. Top-right: view toggle (placeholder).
- Participants panel (right, `--panel-bg`, header "Participants (N)"): row = avatar, name (+ "(Host)" / "(Me)"), muted-mic and camera-off icons in `--muted-red`. Footer buttons: Invite, Mute All, More. Host sees Mute All and per-row Remove.
- Chat panel (right, `--panel-bg`): local-only message list plus input. Bonus.
- Mock participants: 3-4 fake people with initials avatars, names, random muted state. They live in the DB (seeded as participants of the meeting on join), not hardcoded in the UI.
- Leave / End: host sees End meeting for all, others see Leave. Both go to `/meeting/[code]/ended`.

## 4. Database (SQLite, `PRAGMA foreign_keys=ON`)
**users**: id PK, name, email unique, created_at
**meetings**: id PK, meeting_code TEXT UNIQUE INDEXED (11 digits, no spaces), host_id FK users, title, description, type ('instant'|'scheduled'), scheduled_start (UTC, nullable, INDEXED), duration_min INT, status ('scheduled'|'live'|'ended'), created_at, started_at, ended_at
**participants**: id PK, meeting_id FK INDEXED, user_id FK nullable (guests), display_name, role ('host'|'participant'), is_muted BOOL, is_video_off BOOL, status ('joined'|'left'|'removed'), joined_at, left_at
Relationships: users 1-N meetings (host), meetings 1-N participants, users 1-N participants (nullable).
Upcoming = scheduled/live meetings with scheduled_start >= now minus duration, ordered by start asc. Recent = meetings with status 'ended' or a participant row with status 'left', newest first. No separate table.
Add `CHECK` constraints on the enums and `duration_min > 0`.

## 5. API (all under `/api`; errors are `{"detail": "..."}` with the right status)
| Method | Path | Notes |
|---|---|---|
| GET | `/me` | default user |
| POST | `/meetings/instant` | body `{title?}`. Creates a meeting, host participant is NOT auto-added. Returns `{meeting_code, formatted_id, join_url, title}`. |
| POST | `/meetings` | body `{title, description?, scheduled_start (ISO UTC), duration_min}`. 422 if title is empty, start is in the past or duration <= 0. Returns the meeting plus join_url. |
| GET | `/meetings/upcoming` | list |
| GET | `/meetings/recent` | list |
| GET | `/meetings/{code}` | normalizes the code (strips spaces and dashes, extracts digits from a full link such as `https://host/j/123 4567 8901?pwd=x`). 404 `Meeting not found` if there is no match, 410 `Meeting has ended` if ended. |
| PATCH | `/meetings/{code}` | edit title, description, start, duration |
| DELETE | `/meetings/{code}` | delete a scheduled meeting (host only) |
| POST | `/meetings/{code}/join` | body `{display_name}`, 422 if blank after trim. The host joining gets role host. On the first join the status becomes live; if the meeting is empty, seed 3 mock participants. Returns `{participant, meeting}`. |
| POST | `/meetings/{code}/leave` | body `{participant_id}`. Host leaving ends the meeting (status ended, ended_at set) and sets all participants to left. |
| GET | `/meetings/{code}/participants` | active (status joined) only |
| PATCH | `/meetings/{code}/participants/{id}` | body `{is_muted?, is_video_off?}` |
| POST | `/meetings/{code}/mute-all` | host only, 403 otherwise. Mutes everyone except the host. |
| DELETE | `/meetings/{code}/participants/{id}` | host only. Sets status 'removed'. |
Meeting ID display format: `123 4567 8901` (3-4-4). `join_url` = `{FRONTEND_URL}/j/{code}`. Host is identified by `X-Participant-Id` header or `participant_id` field (no auth).

## 6. Seed (runs on startup if the DB is empty; Render free tier wipes SQLite)
- 1 user: Anirudh (anirudh@example.com)
- 4 upcoming scheduled meetings (tomorrow, +2 days, +4 days, next week), realistic titles
- 5 ended meetings with 2-4 participants each, spread over the last 2 weeks
- A pool of mock participant names: Priya Sharma, Rahul Verma, Sneha Iyer, Karthik Rao, Meera Nair

## 7. Hard rules
- Times are stored in UTC and converted on the client. Format: "Today, 7:30 PM", "Tue, Oct 7".
- Every list has loading skeleton + empty state. Every form has validation + inline error. Every API failure shows a toast.
- No giant files. Components under about 150 lines. No inline styles for tokens, use the CSS variables.
- Responsive: sidebar collapses under 768px, tiles stack, toolbar stays usable on mobile.
- Do not touch folders outside the one named in the prompt.

## 8. TODO (needs the human)
- [ ] body font-family from Inspect
- [ ] border radius, toolbar button size, tile gap and shadow values
- [ ] verify toolbar button list/order against screenshots 10-12
- [ ] real Zoom text strings on each screen (copy from the screenshots)

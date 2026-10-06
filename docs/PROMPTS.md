# Antigravity prompts (copy-paste in order)
Rule: one phase = one conversation. After each phase: run it, click through it, `git commit`.
Always attach docs/SPEC.md. For UI phases also attach the matching screenshots from your recon folder (named below).

## Phase 0: Setup (you, 10 min)
```
mkdir zoom-clone && cd zoom-clone && git init
mkdir docs backend frontend
```
Put SPEC.md in docs/. Put your screenshots in docs/screenshots/. Create the GitHub repo (public) and push.

## Phase 1: Backend (CLAUDE)
> Read docs/SPEC.md fully. Build ONLY the backend/ folder: FastAPI + SQLAlchemy + SQLite exactly per sections 4, 5 and 6. Use the structure in section 0. Add CORS using the env var FRONTEND_URL, seed on startup, and a requirements.txt. Then run it and test EVERY endpoint with curl, including: an invalid code, a code with spaces, a full invite link, an empty display name, a past schedule date, duration 0, and a non-host calling mute-all. Fix anything that fails. Do not touch anything outside backend/. At the end, list each endpoint with the curl result.

Check: `uvicorn app.main:app --reload`, open `/docs`, click the endpoints yourself. Commit: `feat: backend`.

## Phase 2: Frontend foundation (GEMINI)
Attach: SPEC.md, 13-after-ending-meeting.png, 02-after-signin-dashboard.png
> Read docs/SPEC.md. Create the Next.js (App Router, TypeScript, Tailwind) app in frontend/. Do ONLY this: (1) styles/tokens.css with every variable from section 2, wired into Tailwind, (2) the font variable, (3) lib/api.ts typed client for every endpoint in section 5, lib/format.ts (meeting ID 3-4-4 formatting, date/time helpers), (4) a shared toast system and skeleton component, (5) the two layouts: Workplace layout (header with arrows, search bar, avatar, gear + narrow sidebar Home/Chat/Meetings/Contacts) and zoom.us layout (wide sidebar). Match colors and spacing to the screenshots. No page content yet. Run `npm run build` and fix errors.

## Phase 3: Home dashboard (GEMINI)
Attach: SPEC.md, 13-after-ending-meeting.png
> Build the `/` page exactly like screenshot 13: big clock and date (live, updates every second), the three tiles (New meeting orange `--orange-new`, Join and Schedule `--blue-tile`) with the same icons, size and layout, and Upcoming and Recent meeting cards fed from the API with skeletons and empty states. New meeting calls POST /meetings/instant, then routes to /meeting/[code]/join. Join opens the Join modal (Meeting ID or link + name, Join disabled until the ID is non-empty, 404 shows an inline error). Schedule goes to /meetings/schedule.

## Phase 4: Meetings pages (GEMINI)
Attach: SPEC.md, 03-meetings-page.png, 04-schedule-meeting-form.png, 05-after-creating-meeting.png
> Build /meetings, /meetings/schedule and /meetings/[code] exactly like these screenshots, using the zoom.us layout. Schedule form: Topic, Description, date + time pickers, duration, time zone (display), Save and Cancel, with validation (no past date, topic required). Save calls POST /meetings, then goes to the detail page. The detail page has the invite link with Copy and Start / Edit / Delete working against the API. Previous tab uses /meetings/recent.

## Phase 5: Pre-join and the meeting room UI (GEMINI)
Attach: SPEC.md, 06, 07, 08, 10, 11, 12 screenshots
> Build /j/[code], /meeting/[code]/join, /meeting/[code] and /meeting/[code]/ended per SPEC section 3 and 3.1, matching screenshots 08, 10, 11 and 12. First pass is UI with local state only: grid layout rules, toolbar, participants panel, chat panel (local messages), camera-off tile, timer. Use the exact dark colors from the tokens. Use a stub participants array for now.

## Phase 6: Wire the room to the backend (CLAUDE)
> Read docs/SPEC.md and frontend/app/meeting/. Replace the stubs with the real API: join on entering the room, poll GET /participants every 3 seconds, mute / mute-all / remove / leave / end all go through the API, host vs participant UI differences. Add getUserMedia: own camera and mic, mute and video toggles that update the participant via PATCH, a graceful fallback if permission is denied or no camera exists, and stop all tracks on leave and on unmount. Touch only frontend/app/meeting and frontend/components/meeting.

Commit: `feat: mock-complete` and `git tag mock-complete`.

## Phase 7: Deploy NOW (me guiding)
Backend on Render (root `backend`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, env FRONTEND_URL). Frontend on Vercel (root `frontend`, env NEXT_PUBLIC_API_URL). Test the live link end to end.

## Phase 8: Polish (GEMINI)
> Go through the app against the screenshots one screen at a time and fix visual differences: spacing, font sizes, hover and active states, icon sizes, transitions on panels. Add responsive behaviour (sidebar collapses under 768px, tiles stack, toolbar fits on mobile), favicon, page titles, and a not-found page. Don't change any API calls.

## Phase 9: README + review (GEMINI draft, CLAUDE review)
README: setup, stack, assumptions (default user, mock participants, SQLite reset on Render, UTC times), ER diagram (mermaid), API table, screenshots. Then ask Claude: "Explain each backend file and each key frontend component as if I'm in the interview."

## Phase 10 (only after mock-complete is deployed): real multi-user
`git checkout -b webrtc`. Ask me when you reach it.

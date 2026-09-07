# Fireflies Clone — Meeting Notes & Transcription Platform

A Fireflies.ai-inspired meeting notes and transcription platform, built as an SDE Fullstack Assignment. Users can browse a dashboard of past meetings, create a new meeting from a pasted or uploaded transcript, and get an auto-generated summary, topic chapters, and a fully interactive, searchable transcript synced to playback — plus full CRUD on meetings and action items.

Live demo: [frontend](https://fireflyfrontend.vercel.app) · [backend API](https://fireflies-backend-fr1m.onrender.com/api/health)

## Overview

The app models a single user's meeting history. Each meeting can carry a full transcript (speaker-attributed, timestamped lines), an AI-written overview, a handful of auto-derived topic chapters, and a list of action items with assignees and due dates. The dashboard supports searching, filtering by participant/date, and sorting; the meeting-detail page ties a real HTML5 audio player to the transcript so clicking any line seeks playback, and playback in turn highlights and auto-scrolls to the active line.

Transcript generation itself is out of scope (see [Assumptions](#assumptions)) — the app consumes already-transcribed text (pasted, uploaded, or seeded) and does the summarization, structuring, and UI work around it.

## Features

- **Meetings dashboard** — search by title, filter by participant or date, sort by recency or title, participant avatars, loading/empty/error states
- **Create meeting** from a pasted or uploaded transcript (`.txt`, `.vtt`, `.json`, auto-detected format) — parses speaker turns, links or creates `Participant` rows, and generates a summary + topics in one atomic transaction
- **AI-generated summary** — a zero-config heuristic overview by default; an optional real Claude-backed generator activates automatically when `ANTHROPIC_API_KEY` is set, with automatic fallback to the heuristic on any failure
- **Auto-derived topics/chapters** — evenly-spaced, timestamp-anchored, clickable to jump the player to that point
- **Interactive transcript** — click any line to seek playback; playback highlights and auto-scrolls to the active line; in-transcript search with match highlighting and next/previous navigation
- **Action items** — create, edit, complete/reopen, delete, with optional assignee and due date, fully persisted through the API
- **Edit / delete meetings** — full-replace edit (title, date, duration, participants) and delete with a confirmation dialog naming every cascaded child resource
- **Health check** — `GET /api/health` verifies real database connectivity, not just process liveness
- **Honest placeholders** for features explicitly out of scope: joining a live call, Share, Team, and a Settings/Integrations hub (Zoom, Google Meet, Google Calendar, Slack, HubSpot)

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- lucide-react (icons)

**Backend**
- FastAPI
- SQLAlchemy 2.0 (ORM)
- Pydantic v2 + pydantic-settings
- Uvicorn (ASGI server)
- Anthropic SDK (optional, only for real LLM-generated summaries)

**Database**
- SQLite

**Testing**
- pytest + httpx (backend, 45 tests)
- `tsc --noEmit` + ESLint (frontend)

## Architecture

```
Next.js frontend  ──REST (fetch)──▶  FastAPI backend  ──SQLAlchemy──▶  SQLite (fireflies.db)
```

The backend is layered so each piece has exactly one job:

```
routers/       thin HTTP layer — parse the request, call a service, return its result.
               No SQLAlchemy imports here.
services/      business rules and orchestration — existence checks, participant/
               assignee validation, full-replace semantics for PUT, transcript
               parsing + summary generation on meeting creation.
repositories/  data access only — queries and commits, no business rules.
               One module per aggregate.
models/        SQLAlchemy ORM table definitions.
schemas/       Pydantic request/response shapes, decoupled from the ORM models.
```

Domain exceptions (`NotFoundError`, `InvalidInputError`) are raised in the service layer and translated to HTTP status codes by exception handlers in `main.py`, keeping services/repositories framework-agnostic.

The frontend mirrors this with `lib/api.ts` (a single typed fetch client — the only place that knows API routes exist) and `lib/types.ts` (TypeScript types mirroring the backend's Pydantic schemas), so components never call `fetch` directly.

## Database Schema

```
users                  id, name, email (unique), avatar_color, created_at

participants           id, name, email (unique, nullable), avatar_color

meetings               id, user_id FK→users, title, date, duration_seconds,
                       media_url, status, created_at, updated_at
                       CHECK duration_seconds >= 0
                       INDEX  date, title

meeting_participants   meeting_id FK→meetings (CASCADE), participant_id FK→participants (CASCADE)
                       composite PK (meeting_id, participant_id)      — M:N join table
                       INDEX  participant_id (reverse lookup)

transcript_segments    id, meeting_id FK→meetings (CASCADE),
                       speaker_id FK→participants (SET NULL, nullable),
                       start_time_sec, end_time_sec, text, order_index
                       CHECK end_time_sec >= start_time_sec
                       INDEX  (meeting_id, order_index)

summaries              id, meeting_id FK→meetings (CASCADE, UNIQUE — 1:1), overview_text

topics                 id, meeting_id FK→meetings (CASCADE), title, order_index,
                       start_time_sec (nullable — optional jump-to-chapter marker)
                       INDEX  (meeting_id, order_index)

action_items           id, meeting_id FK→meetings (CASCADE), text,
                       assignee_id FK→participants (SET NULL, nullable),
                       due_date (nullable), is_complete, created_at, updated_at
                       INDEX  meeting_id
```

**Relationships**
- `users` → `meetings` is one-to-many (a single seeded user in this build).
- `meetings` ↔ `participants` is many-to-many via the `meeting_participants` join table — a participant can attend several meetings, and a meeting has several participants.
- `meetings` → `transcript_segments`, `topics`, `action_items` are one-to-many; `meetings` → `summaries` is one-to-one (enforced by a unique constraint on `meeting_id`).
- `transcript_segments.speaker_id` and `action_items.assignee_id` both reference `participants` with `ON DELETE SET NULL` — deleting a participant un-assigns their lines/tasks rather than deleting meeting content.
- All meeting-owned child rows use `ON DELETE CASCADE`, so deleting a meeting removes its segments, summary, topics, action items, and join rows in one operation.

Schema is created via SQLAlchemy's `create_all()` (see `backend/app/db.py`), not a migrations tool — a deliberate simplification appropriate for a from-scratch SQLite project at this scope.

## API Documentation

```
GET    /api/health                                  liveness + real DB connectivity check

GET    /api/meetings          ?search=&participant=&date=&sort=recent|title
POST   /api/meetings                                 optional transcript_text — parses it and
                                                       generates a summary + topics
GET    /api/meetings/{id}                            full detail incl. transcript/summary/
                                                       topics/action items
PUT    /api/meetings/{id}                             full replace
DELETE /api/meetings/{id}                             cascades to segments/summary/topics/
                                                       action items

GET    /api/meetings/{id}/transcript                  ordered by order_index
GET    /api/meetings/{id}/summary                     404 if not generated yet
GET    /api/meetings/{id}/topics                      ordered by order_index

GET    /api/meetings/{id}/action-items
POST   /api/meetings/{id}/action-items
PUT    /api/action-items/{id}                         full replace
DELETE /api/action-items/{id}

GET    /api/participants
```

`PUT` endpoints are a full replace, not a partial patch — every core field must be supplied, and omitting `participant_ids` on a meeting clears its participants rather than leaving them untouched.

**Errors:** a missing resource → `404 {"detail": "..."}`; valid-shape-but-invalid input (e.g. an unknown `assignee_id`) → `400 {"detail": "..."}`; a body that fails Pydantic validation → FastAPI's standard `422`; unhandled errors → `500 {"detail": "Internal server error"}` (logged server-side, detail hidden from the client).

Interactive Swagger docs are auto-generated at `/docs` (raw schema at `/openapi.json`) from the routers/schemas above — run the backend locally and open `http://localhost:8001/docs` to try every endpoint.

## Project Structure

```
backend/
  app/
    models/        SQLAlchemy ORM models (one file per table)
    schemas/        Pydantic request/response schemas
    routers/        FastAPI route handlers (meetings, action_items, participants, health)
    services/       business logic (meeting_service, action_item_service, participant_service,
                    ai_summary, transcript_parser)
    repositories/   data-access layer (one module per aggregate)
    config.py       environment-driven Settings (pydantic-settings)
    db.py           engine/session setup, init_db()
    main.py         FastAPI app, CORS, exception handlers, router registration
  scripts/start.sh  production entrypoint — seed-if-empty, then start uvicorn
  seed.py           inserts 5 realistic seeded meetings
  tests/            pytest suite (45 tests)
  Dockerfile        explicit build, used by both local Docker and the deploy platform

frontend/
  app/
    page.tsx         marketing landing page (no API calls)
    (app)/            route group for shell-wrapped app pages (share the Sidebar/Topbar)
      dashboard/      meetings dashboard
      meetings/[id]/  meeting detail page
      tasks/, settings/  placeholder pages
  components/
    layout/          Sidebar, Topbar, AppShell
    meetings/         dashboard components (list, filters, search, create modal)
    meeting-detail/   detail-page components (transcript, summary, topics, action items, player)
    marketing/        landing-page components
    ui/               shared primitives (Modal, ConfirmDialog, Select, ToastProvider, ...)
  lib/
    api.ts            typed fetch client — the only place that calls the backend
    types.ts          TypeScript types mirroring the backend's Pydantic schemas
    format.ts          date/time formatting helpers
    hooks/             useMediaPlayer, useDebouncedValue
```

## Local Setup

### Backend

```bash
cd backend
python3.12 -m venv venv
./venv/bin/pip install -r requirements.txt
cp .env.example .env
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

## Environment Variables

| File | Variable | Purpose |
|---|---|---|
| `backend/.env` | `DATABASE_URL` | SQLite connection string (default `sqlite:///./fireflies.db`) |
| `backend/.env` | `CORS_ORIGINS` | Comma-separated list of allowed frontend origins |
| `backend/.env` | `ANTHROPIC_API_KEY` | Optional. Blank = heuristic summary generator (default, no network calls). Set it (and `pip install anthropic`) to have Claude generate real summaries/topics from transcript text instead. |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | Backend base URL the frontend calls (default `http://localhost:8001`) |

No secrets are committed — `.env` / `.env.local` are gitignored; only `.env.example` / `.env.local.example` templates are tracked.

## Running the Application

**Backend** (from `backend/`, after [Local Setup](#local-setup)):

```bash
./venv/bin/python seed.py          # creates fireflies.db with 5 realistic seeded meetings
./venv/bin/uvicorn app.main:app --reload --port 8001
```

API docs: http://localhost:8001/docs

**Frontend** (from `frontend/`):

```bash
npm run dev
```

App: http://localhost:3000

> `/` is a static marketing landing page and makes no API calls. Start the backend before clicking "Get Started" — `/dashboard` fetches `/api/meetings` on load.

## Seed Data

`backend/seed.py` populates the database with 5 realistic meetings — full transcripts, AI-style summaries, topics, and action items — so the app looks and behaves like a populated product from the very first run, with no manual data entry required to evaluate it. It reuses a small pool of participants across meetings (e.g. one participant attends three of the five meetings as the same underlying row) to demonstrate the meetings↔participants many-to-many relationship rather than duplicating people per meeting. `scripts/start.sh` runs this automatically on first boot in production and skips it on every later restart once the database file already exists, so real data created afterward is never wiped or duplicated.

## Design Decisions

- **Layered backend (routers → services → repositories).** Keeps HTTP concerns, business rules, and data access independently testable and swappable — e.g. the ORM could be replaced without touching services or routers.
- **Summary generation behind an interface (`SummaryGenerator`).** `HeuristicSummaryGenerator` needs no API key or network access, so meeting creation always works out of the box; `LLMSummaryGenerator` (Claude) sits behind the exact same interface and is wrapped so any failure (bad key, network, malformed response) transparently falls back to the heuristic instead of breaking meeting creation.
- **`Participant` is separate from `User`.** A participant is anyone attendable/speakable in a meeting (including the app's own user, who also has a participant row so they can appear in transcripts) — mirroring how a real product separates "account" from "contact/attendee."
- **Transcript upload needs no separate multipart endpoint.** The frontend reads an uploaded file client-side via `FileReader` into the same textarea the paste path uses, so a single `transcript_text` string field on `POST /api/meetings` covers paste and upload for all three supported formats (plain `[MM:SS] Speaker: text`, WebVTT, JSON).
- **Topics are timestamp-anchored, not real topic modeling.** A handful of evenly-spaced segments are picked and titled (from the summary generator's own topic list when available, otherwise a text snippet), so "jump to this point" always stays accurate regardless of transcript length.
- **`PUT` is a full replace, not `PATCH`.** Every core field must be supplied and omitting `participant_ids` clears them — a deliberate, explicit contract rather than partial-update ambiguity.
- **No migrations tool.** Schema is created via SQLAlchemy's `create_all()` — appropriate for a from-scratch SQLite project at this scope; would move to Alembic if the schema needed to evolve against real production data.
- **Idempotent seeding in production.** The deploy entrypoint (`scripts/start.sh`) seeds only if the database file doesn't already exist, so a redeploy or restart on a persistent disk never duplicates or wipes real data; `seed.py` itself always inserts unconditionally, by design, for a predictable local-dev reset.

## Assumptions

- **Real speech-to-text is out of scope.** The app consumes already-transcribed text (pasted, uploaded as `.txt`/`.vtt`/`.json`, or seeded) — no audio-to-text model runs anywhere in the stack.
- **Real authentication is out of scope.** A single seeded user stands in for the logged-in user, per the assignment's scope; there is no login flow, session, or token.
- **Third-party integrations, live-call bots, and Team/Share are placeholders.** Zoom/Google Meet/Google Calendar/Slack/HubSpot, joining a live call, and multi-user sharing are UI stubs that surface an honest "coming soon" toast rather than being silently absent.
- **Transcripts and summaries are mocked/seeded or generated by a lightweight heuristic**, not a production LLM pipeline, unless `ANTHROPIC_API_KEY` is explicitly configured.
- **Meeting audio is a placeholder.** `frontend/public/sample-audio.wav` is a short locally-generated tone (no network download, no copyright concerns), looped under a logical playback clock driven by the meeting's real `duration_seconds` — real, audible HTML5 `<audio>` playback, just not a real recording.
- **Single-instance, single-worker deployment.** SQLite uses file-level locking; this app is not designed to run with multiple uvicorn workers or horizontally-scaled instances against the same database file.

## Future Improvements

- Real authentication (multi-user accounts, sessions/JWT) instead of a single seeded user
- Real speech-to-text integration for audio/video uploads instead of pre-transcribed text only
- Live-call bot joining (Zoom/Meet/Teams) for automatic capture
- Real third-party integrations (calendar sync, Slack notifications, CRM export)
- Team workspaces and meeting sharing with granular permissions
- Migrate from SQLite to a networked database (e.g. Postgres) to support multi-instance scaling
- Alembic migrations if the schema needs to evolve against real production data
- Full-text search across transcripts (not just meeting titles)

## Deployment

The app is deployed and live: [frontend](https://fireflyfrontend.vercel.app) on Vercel, [backend](https://fireflies-backend-fr1m.onrender.com) on Render.

**Frontend → Vercel.** Zero-config for Next.js App Router. The app is entirely client-fetched (no Next.js API routes, no server component hits the DB directly), so there's nothing Vercel-specific to work around.

**Backend → Render** (`render.yaml` at the repo root, imported as a [Blueprint](https://dashboard.render.com/blueprints)). FastAPI needs a long-running process, not a serverless function, so a FaaS target (Vercel/Netlify functions, AWS Lambda) is the wrong fit. The build uses an explicit `backend/Dockerfile` (`runtime: docker` in `render.yaml`) instead of Render's auto-detected Python builder, removing any ambiguity about Python version or start command. **Render requires card verification to create a Blueprint at all, regardless of plan** — confirmed directly, not assumed; have a card ready before starting.

**Is SQLite safe here?** Yes, under real constraints: single instance, single worker only (file-level locking); not safe on serverless/free-tier ephemeral filesystems, since a local file is wiped on every restart/redeploy; this needs a paid instance plan with a persistent disk. `render.yaml` mounts a 1GB disk at `/var/data`, with `DATABASE_URL=sqlite:////var/data/fireflies.db` (an *absolute* path inside the mount — a relative path would resolve against the ephemeral working directory instead).

**Environment variables in production:**

| Platform | Variable | Value |
|---|---|---|
| Render | `DATABASE_URL` | `sqlite:////var/data/fireflies.db` (set in `render.yaml`) |
| Render | `CORS_ORIGINS` | the Vercel production URL — set manually in the dashboard, not committed |
| Render | `ENVIRONMENT` | `production` (set in `render.yaml`) |
| Render | `ANTHROPIC_API_KEY` | optional, only for real LLM summaries — set manually if used |
| Vercel | `NEXT_PUBLIC_API_URL` | the Render backend URL |

`PORT` needs no configuration — Render injects it automatically at runtime, and `scripts/start.sh` reads it via `${PORT:-8001}` shell substitution.

**CORS** is environment-driven (`settings.cors_origins_list` in `main.py`) — set `CORS_ORIGINS` to the real Vercel domain. Not `*`: `allow_credentials=True` is set, and browsers reject wildcard origins alongside credentialed requests.

**Health check.** `GET /api/health` checks real DB connectivity (`SELECT 1`), wired into `render.yaml` as `healthCheckPath`.

**Seeding in production.** `scripts/start.sh` (the Dockerfile's `CMD`) seeds the database only if it doesn't already exist at `DATABASE_URL`'s path, then starts uvicorn — first deploy seeds automatically, every later restart/redeploy skips seeding since the file persists on the disk.

### What you need to do manually

1. **Render (backend):** push this repo to GitHub, create a new Blueprint at [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints) pointing at it (card required). Confirm the plan is Starter or above. After the frontend is deployed, set `CORS_ORIGINS` in Render's Environment tab to its exact URL. Note the backend's public URL for the next step.
2. **Vercel (frontend):** import this repo at [vercel.com/new](https://vercel.com/new), set **Root Directory** to `frontend`, add `NEXT_PUBLIC_API_URL` = the Render URL from step 1, deploy.
3. **Close the loop:** back in Render, confirm `CORS_ORIGINS` matches the real Vercel URL, and redeploy the backend if it was changed.
4. **Verify:** visit `<render-url>/api/health` (should show `{"status":"ok","database":"connected"}`), then the Vercel URL → dashboard should load the 5 seeded meetings.

## Testing

```bash
cd backend && ./venv/bin/python -m pytest -q      # 45 tests: CRUD, validation, 404s, cascades, filters, transcript parsing
cd frontend && npx tsc --noEmit && npx eslint .
```

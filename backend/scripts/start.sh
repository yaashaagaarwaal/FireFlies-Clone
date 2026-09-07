#!/usr/bin/env bash
# Production entrypoint. Seeds the database only if it doesn't already exist
# at DATABASE_URL's path, so a single run is idempotent — seed.py itself has
# no such guard (it always inserts), so the check has to live here.
#
# On a persistent disk this means "seed once, ever": the file survives
# restarts, so later boots skip straight to serving and real data is never
# duplicated or overwritten.
#
# On Render's free plan (this project's current config — see render.yaml)
# there is NO persistent disk: every restart/redeploy/idle spin-down starts
# from a blank filesystem, so this check evaluates true every time and the
# database is reseeded fresh on every boot. That's intentional here — it
# keeps the demo populated instead of showing an empty dashboard — but it
# also means nothing a user creates or edits survives a restart.
set -euo pipefail

cd "$(dirname "$0")/.."

DB_PATH=$(python -c "from app.config import settings; print(settings.database_url.removeprefix('sqlite:///'))")

if [ ! -f "$DB_PATH" ]; then
  echo "No database found at $DB_PATH — seeding initial data..."
  python seed.py
else
  echo "Database already exists at $DB_PATH — skipping seed."
fi

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8001}"

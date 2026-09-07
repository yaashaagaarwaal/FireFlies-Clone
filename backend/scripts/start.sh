#!/usr/bin/env bash
# Production entrypoint. Seeds the database only if it doesn't already exist
# at DATABASE_URL's path, so a single run is idempotent — seed.py itself has
# no such guard (it always inserts), so the check has to live here.
#
# With a persistent volume this means "seed once, ever": the file survives
# restarts, so later boots skip straight to serving and real data is never
# duplicated or overwritten. Without one (no volume attached), every
# restart/redeploy starts from a blank filesystem, so this reseeds fresh
# demo data on every boot instead — which keeps the app usable rather than
# showing an empty dashboard, at the cost of not persisting real changes.
set -euo pipefail

cd "$(dirname "$0")/.."

DB_PATH=$(python -c "from app.config import settings; print(settings.database_url.removeprefix('sqlite:///'))")

if [ ! -f "$DB_PATH" ]; then
  echo "No database found at $DB_PATH — seeding initial data..."
  python seed.py
else
  echo "Database already exists at $DB_PATH — skipping seed."
fi

# Railway (and most PaaS hosts) inject PORT at runtime — 8080 on Railway,
# confirmed against their own docs. ${PORT:-8001} falls back to 8001 only if
# nothing injects it (e.g. running this script by hand).
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8001}"

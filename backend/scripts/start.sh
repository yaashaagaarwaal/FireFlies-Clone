#!/usr/bin/env bash
# Production entrypoint. Seeds the database only on first boot — once
# fireflies.db exists on the mounted persistent disk, later restarts and
# redeploys skip straight to serving, so real data is never duplicated or
# overwritten. seed.py itself has no such guard (it always inserts), so this
# check has to live here rather than there.
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

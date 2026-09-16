#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source ./.env
  set +a
fi

BACKUP_DATABASE_URL="${PRO_DIRECT_DATABASE_URL:-${PRO_DATABASE_URL:-}}"

if [[ -z "$BACKUP_DATABASE_URL" ]]; then
  echo "Missing PRO_DIRECT_DATABASE_URL or PRO_DATABASE_URL in .env."
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump is required but was not found."
  exit 1
fi

BACKUP_FILE="production-backup-$(date +%Y%m%d-%H%M%S).dump"

echo "Creating PostgreSQL backup: $BACKUP_FILE"
pg_dump \
  --format=custom \
  --no-owner \
  --no-acl \
  --lock-wait-timeout=30s \
  --file="$BACKUP_FILE" \
  "$BACKUP_DATABASE_URL"

pg_restore --list "$BACKUP_FILE" >/dev/null

echo "Backup completed: $PROJECT_ROOT/$BACKUP_FILE"
ls -lh "$BACKUP_FILE"

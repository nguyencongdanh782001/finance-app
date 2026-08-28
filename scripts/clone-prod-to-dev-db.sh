#!/usr/bin/env bash
set -Eeuo pipefail

if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

PRO_URL="${PRO_DATABASE_URL:-}"
DEV_URL="${DEV_DATABASE_URL:-}"
CONFIRM_VALUE="${CONFIRM_DEV_DB_RESET:-}"

if [ -z "$PRO_URL" ]; then
  echo "Missing PRO_DATABASE_URL."
  echo "Add it to your local .env before cloning production data."
  exit 1
fi

if [ -z "$DEV_URL" ]; then
  echo "Missing dev database URL."
  echo "Set DEV_DATABASE_URL."
  exit 1
fi

if [ "$PRO_URL" = "$DEV_URL" ]; then
  echo "Refusing to run because production and development database URLs are identical."
  exit 1
fi

if [ "$CONFIRM_VALUE" != "clone-prod-to-dev" ]; then
  echo "This command overwrites the development database with production data."
  echo "Run it with CONFIRM_DEV_DB_RESET=clone-prod-to-dev when you are sure."
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump is required but was not found."
  exit 1
fi

if ! command -v pg_restore >/dev/null 2>&1; then
  echo "pg_restore is required but was not found."
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required but was not found."
  exit 1
fi

TIMESTAMP="$(date +%Y%m%d%H%M%S)"
BACKUP_DIR="${TMPDIR:-/tmp}/finance-app-db-clone"
PROD_DUMP="$BACKUP_DIR/prod-$TIMESTAMP.dump"
DEV_BACKUP="$BACKUP_DIR/dev-before-clone-$TIMESTAMP.dump"

mkdir -p "$BACKUP_DIR"

reset_dev_schema() {
  psql "$DEV_URL" \
    --set ON_ERROR_STOP=1 \
    --command 'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;'
}

restore_dev_backup_on_error() {
  local exit_code=$?
  trap - ERR
  echo "Clone failed. Restoring the development backup..."
  set +e
  reset_dev_schema
  pg_restore --exit-on-error --no-owner --no-acl \
    --dbname "$DEV_URL" "$DEV_BACKUP"
  local restore_exit_code=$?
  set -e

  if [ "$restore_exit_code" -eq 0 ]; then
    echo "Development database was restored from: $DEV_BACKUP"
  else
    echo "WARNING: Automatic development backup restore failed."
    echo "Backup file: $DEV_BACKUP"
  fi

  exit "$exit_code"
}

echo "Creating production dump..."
pg_dump "$PRO_URL" -Fc --no-owner --no-acl -f "$PROD_DUMP"

echo "Creating development backup before overwrite..."
pg_dump "$DEV_URL" -Fc --no-owner --no-acl -f "$DEV_BACKUP"

trap restore_dev_backup_on_error ERR

echo "Restoring production dump into development database..."
reset_dev_schema
pg_restore --exit-on-error --no-owner --no-acl \
  --dbname "$DEV_URL" "$PROD_DUMP"

echo "Applying current development migrations..."
DEV_DATABASE_URL="$DEV_URL" DATABASE_URL="$DEV_URL" \
npx prisma migrate deploy --schema prisma/schema.prisma

echo "Checking development migration status..."
DEV_DATABASE_URL="$DEV_URL" DATABASE_URL="$DEV_URL" \
npx prisma migrate status --schema prisma/schema.prisma

trap - ERR

echo "Done."
echo "Production dump: $PROD_DUMP"
echo "Development backup: $DEV_BACKUP"

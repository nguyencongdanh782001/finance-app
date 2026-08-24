#!/usr/bin/env bash
set -euo pipefail

if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

PROD_URL="${PROD_DATABASE_URL:-${PRODUCTION_DATABASE_URL:-}}"
DEV_URL="${DEV_DATABASE_URL_PRISMA_DATABASE_URL:-${DEV_DATABASE_URL_POSTGRES_URL:-${DATABASE_URL:-}}}"
CONFIRM_VALUE="${CONFIRM_DEV_DB_RESET:-}"

if [ -z "$PROD_URL" ]; then
  echo "Missing PROD_DATABASE_URL or PRODUCTION_DATABASE_URL."
  echo "Add it to your local .env before cloning production data."
  exit 1
fi

if [ -z "$DEV_URL" ]; then
  echo "Missing dev database URL."
  echo "Set DEV_DATABASE_URL_PRISMA_DATABASE_URL or DEV_DATABASE_URL_POSTGRES_URL."
  exit 1
fi

if [ "$PROD_URL" = "$DEV_URL" ]; then
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

TIMESTAMP="$(date +%Y%m%d%H%M%S)"
BACKUP_DIR="${TMPDIR:-/tmp}/finance-app-db-clone"
PROD_DUMP="$BACKUP_DIR/prod-$TIMESTAMP.dump"
DEV_BACKUP="$BACKUP_DIR/dev-before-clone-$TIMESTAMP.dump"

mkdir -p "$BACKUP_DIR"

echo "Creating production dump..."
pg_dump "$PROD_URL" -Fc --no-owner --no-acl -f "$PROD_DUMP"

echo "Creating development backup before overwrite..."
pg_dump "$DEV_URL" -Fc --no-owner --no-acl -f "$DEV_BACKUP"

echo "Restoring production dump into development database..."
pg_restore --clean --if-exists --no-owner --no-acl --dbname "$DEV_URL" "$PROD_DUMP"

echo "Checking development migration status..."
DATABASE_URL="$DEV_URL" \
DEV_DATABASE_URL_PRISMA_DATABASE_URL="$DEV_URL" \
npx prisma migrate status --schema prisma/schema.prisma

echo "Done."
echo "Production dump: $PROD_DUMP"
echo "Development backup: $DEV_BACKUP"

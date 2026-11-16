.PHONY: help backup-prod db-backup-prod

help:
	@printf '%s\n' \
		'make backup-prod     - Tạo backup PostgreSQL production dạng custom dump' \
		'make db-backup-prod  - Alias của backup-prod'

backup-prod:
	@bash scripts/backup-prod-db.sh

db-backup-prod: backup-prod

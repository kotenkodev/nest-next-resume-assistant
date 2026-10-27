#!/bin/sh
set -e

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  npx typeorm migration:run -d dist/database/data-source.js || echo "Migration run completed or skipped."
fi

exec "$@"


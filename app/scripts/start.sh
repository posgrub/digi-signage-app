#!/bin/sh
set -e

echo "=== PosezTech Signage Startup ==="
node migrate.mjs 2>&1 || echo "Migration warning (continuing anyway)"
echo "Starting server..."
exec node server.js

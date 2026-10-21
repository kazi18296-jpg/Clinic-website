#!/bin/bash

echo "=== Installing Dependencies ==="
python3 -m pip install --break-system-packages -r requirements.txt || pip install --break-system-packages -r requirements.txt || pip install -r requirements.txt

echo "=== Running Database Migrations ==="
python3 manage.py migrate --noinput || python manage.py migrate --noinput

echo "=== Seeding Demo Data ==="
python3 seed_data.py || python seed_data.py

echo "=== Collecting Static Files for Vercel CDN ==="
python3 manage.py collectstatic --noinput --clear || python manage.py collectstatic --noinput --clear

# Ensure css and js directories exist inside staticfiles so relative and direct paths never 404
mkdir -p staticfiles/css staticfiles/js staticfiles/assets
cp -r css/* staticfiles/css/ 2>/dev/null || true
cp -r js/* staticfiles/js/ 2>/dev/null || true
cp -r assets/* staticfiles/assets/ 2>/dev/null || true

echo "=== Build Complete ==="

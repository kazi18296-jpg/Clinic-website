#!/bin/bash

# Fix for "error: externally-managed-environment" on modern Debian/Ubuntu/Vercel Python 3.12+
python3 -m pip install --break-system-packages -r requirements.txt || pip install --break-system-packages -r requirements.txt || pip install -r requirements.txt

# Run migrations, collect static assets, and seed initial database
python3 manage.py collectstatic --noinput --clear || python manage.py collectstatic --noinput --clear
python3 manage.py migrate --noinput || python manage.py migrate --noinput
python3 seed_data.py || python seed_data.py

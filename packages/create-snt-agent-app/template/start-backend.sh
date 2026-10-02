#!/bin/bash
# Starts the backend exactly as the container does — same server, same settings.
# Everything lives in backend/gunicorn.conf.py; see that file for why.
cd "$(dirname "$0")/backend"
source .venv/bin/activate
exec gunicorn -c gunicorn.conf.py app:app

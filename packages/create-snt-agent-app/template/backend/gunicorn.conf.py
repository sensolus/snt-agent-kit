"""Gunicorn settings — the single source of truth for how this app is served.

Local development and the container run the SAME server with the SAME settings:

    ./start-backend.sh                              (development)
    gunicorn -c backend/gunicorn.conf.py app:app    (the Dockerfile CMD)

That is deliberate. The app used to run Flask's development server (Werkzeug)
locally and gunicorn in the image, and the two drifted: Flask-SocketIO refuses
to start Werkzeug when no terminal is attached, so every scaffolded app booted
fine on a laptop and failed in the Agent Manager with "The Werkzeug web server
is not designed to run in production" (STIC-16081). There is now one entry
point, so a bug like that cannot survive local testing.

Keep this file as the only place these numbers appear. If you change a setting
here, both development and production pick it up.
"""

import os

# app.py imports its siblings by bare name (db_config, models, extensions,
# init_db), so backend/ has to be the working directory and on sys.path.
# Derived from this file's own location rather than hardcoded, so gunicorn can
# be launched from the repo root (start-backend.sh) or from /app (the image).
chdir = os.path.dirname(os.path.abspath(__file__))

bind = '0.0.0.0:5000'

# APScheduler runs in-process and the bootstrap in app.py applies migrations at
# import time. A second worker would duplicate both — run exactly one.
workers = 1

# Concurrency comes from threads instead, matching Flask-SocketIO's
# async_mode='threading'.
threads = 8

# Long-running requests (the daily-summary action, a large paged proxy call)
# must not be killed at gunicorn's 30s default.
timeout = 600

# Access log to stdout: the container collects it, and locally it is the
# request log the Flask dev server used to print.
accesslog = '-'

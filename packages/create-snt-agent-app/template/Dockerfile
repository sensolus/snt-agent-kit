# Build stage - build the React frontend
FROM node:20-slim AS builder

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
RUN npm run build

# Production stage - serve with Flask
FROM python:3.12-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Flask app and built frontend
COPY backend/ backend/
COPY --from=builder /app/frontend/dist frontend/dist/
# Single-source app descriptor (served at /.well-known/sensolus-app at runtime).
# PROJECT_ROOT in app.py resolves to /app, so it must live at the image root.
COPY sensolus-app.yaml ./

# Run as non-root user
RUN groupadd --system --gid 1001 app \
 && useradd --system --uid 1001 --gid app --no-create-home app \
 && chown -R app:app /app
USER app

EXPOSE 5000

ENV PYTHONUNBUFFERED=1

# Every setting (chdir, workers, threads, timeout, bind, access log) lives in
# backend/gunicorn.conf.py, which `./start-backend.sh` also uses — development
# and production run the same server the same way, by construction. See that
# file for the reasoning behind each value.
CMD ["gunicorn", "-c", "backend/gunicorn.conf.py", "app:app"]

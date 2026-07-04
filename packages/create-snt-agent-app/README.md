# @sensolus/create-snt-agent-app

Scaffold a new Sensolus agent app: a React (Vite) frontend wired to
[`@sensolus/snt-agent-kit`](https://www.npmjs.com/package/@sensolus/snt-agent-kit)
plus a Flask backend that proxies the Sensolus public API, with PostgreSQL,
migrations, Docker, and Jenkins CI included.

Widgets, theme, colors, and the i18n framework all come from
`@sensolus/snt-agent-kit` — see its README for the component reference and
provider API. This README covers the *generated app*: how the pieces fit
together, how auth works, and how it deploys.

## Quick start

```bash
npm create @sensolus/snt-agent-app my-app
cd my-app
cp .env.example .env             # fill in MAPBOX_KEY + LOCATIONIQ_KEY (required for SntMap)
cd frontend && npm install       # frontend deps
pip install -r backend/requirements.txt
cd frontend && npm run dev       # frontend on :3000
python backend/app.py            # backend on :5000 (separate terminal)
```

Open http://localhost:3000. The Vite dev server proxies `/api/*` to Flask on
`:5000`. In production, Flask serves the built frontend from `frontend/dist/`
and the same `/api/*` endpoints, so one container hosts both.

## Generated layout

```
my-app/
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── main.jsx          # entry — wraps app in SntUiProvider + LocaleProvider
│   │   ├── App.jsx           # react-router routes
│   │   ├── AppConfigContext  # exposes runtime config from /api/config
│   │   ├── pages/            # route components
│   │   ├── hooks/            # app-owned hooks (e.g. useFavourites)
│   │   ├── i18n/             # app-owned translation keys, merged into LocaleProvider
│   │   └── styles/
│   ├── index.html
│   ├── vite.config.js        # dev proxy /api → localhost:5000
│   ├── package.json
│   └── eslint.config.js      # blocks kit deep imports + Snt* re-declarations
├── backend/                  # Flask API + static host
│   ├── app.py                # routes: /api/*, /cron/*, /.well-known/sensolus-app
│   ├── sensolus_client_api.py# outbound Sensolus REST client (cookie or apiKey)
│   ├── models.py             # SQLAlchemy models
│   ├── db_config.py          # PostgreSQL connection from env
│   ├── extensions.py         # shared SQLAlchemy instance
│   ├── init_db.py            # first-run: create DB + run migrations
│   ├── migrations/           # Alembic (flask-migrate)
│   └── requirements.txt
├── infra/
│   └── docker-compose.yml    # local PostgreSQL 17 + PostGIS
├── scripts/
│   └── create-ecr-repo.sh    # one-time ECR bootstrap
├── Dockerfile                # multi-stage: node build → python runtime
├── Jenkinsfile               # build + push to ECR
├── openapi.json              # Sensolus public API spec (reference)
└── .env.example
```

## How the pieces connect

1. **Frontend** calls `/api/*` on its own origin.
2. In dev, **Vite** proxies `/api/*` to Flask on `:5000`. In prod, Flask
   handles them directly and also serves `frontend/dist/` as static files.
3. **Flask** forwards Sensolus-shaped calls to `cloud.sensolus.com` via
   `sensolus_client_api.make_sensolus_request()`, attaching whichever
   credential it has (see auth below).
4. **App-owned endpoints** (favourites, org-stats, config, geocode) hit
   PostgreSQL or third-party proxies — they never leave the Flask layer.

```
Browser ── /api/organisations ──▶ Vite (:3000)
                                   └─ proxy ─▶ Flask (:5000)
                                                └─ cloud.sensolus.com/rest/api/v2/organisations
```

## Authentication

### End-user auth to Sensolus (frontend → Flask → cloud.sensolus.com)

The Flask layer supports two credential sources and picks whichever is
available, session cookie first:

| Source | How Flask gets it | Sent upstream as |
|---|---|---|
| **Session cookie** (`prod-sensolus-token`) | Browser sends it automatically to `cloud.sensolus.com` and, for same-site deploys, to this app | `Authorization: Bearer <token>` |
| **API key** | User pastes it into the app; Flask validates it against `/loginInfo` and stores it in the server-side session | `?apiKey=<key>` query param |

Endpoints: `POST /api/auth/api-key` (validate + store), `DELETE
/api/auth/api-key` (clear), `GET /api/auth/check` (which credentials the
current session has).

### Manager auth (Sensolus platform → this app)

Two endpoints require the platform's own auth, not the end user's:

- `GET /.well-known/sensolus-app` — the app descriptor (`APP_DESCRIPTOR` in
  `app.py`): landing pages, cron jobs, DB flag, required secrets.
- `POST /cron/*` — scheduled jobs triggered by the platform.

Both check the `X-Sensolus-Manager-Auth` header against the
`MANAGER_AUTH_KEY` env var. Cron endpoints additionally receive an
`X-Sensolus-Auth` header carrying the API key to use for that run.

### App descriptor

Lives in `APP_DESCRIPTOR` in [backend/app.py](template/backend/app.py). It
declares landing pages (deep-link targets), cron schedules, whether the app
uses the database, and which secrets it needs (`reverseGeocoding`, etc.).
The platform reads this at registration time.

## Runtime configuration

Map provider keys (`MAPBOX_KEY`, `LOCATIONIQ_KEY`) are **never** baked into
the frontend bundle. Flask reads them from env at request time and serves
them from `GET /api/config`, which `AppConfigContext` fetches on mount.
Effect: one Docker image deploys to dev/demo/prod — only the container's env
changes.

`.env` is loaded at Flask startup (`load_dotenv` from `python-dotenv`) and
is gitignored. In Docker, pass keys with `-e MAPBOX_KEY=... -e
LOCATIONIQ_KEY=...`.

## Database

PostgreSQL 17 with PostGIS. Config comes from env (`DB_HOST`, `DB_PORT`,
`DB_NAME`, `DB_USER`, `DB_PASSWORD`) — see `backend/db_config.py`.

- **Local:** `cd infra && docker compose up -d`
- **Migrations:** flask-migrate (Alembic) — sources in `backend/migrations/`.
  `init_db.py` creates the database on first boot (if missing) and applies
  migrations before the Flask app starts serving.
- **Models:** `backend/models.py` — extend here; then `flask db migrate -m
  "…"` from the `backend/` directory to generate a migration.

## Background jobs

Two paths, use whichever fits:

- **APScheduler** (in-process) — decorate a function in `backend/app.py`
  with `@scheduler.task(...)` for jobs that run inside the Flask process.
  The template ships a `heartbeat` job as a working example.
- **Platform cron** — declare the job in `APP_DESCRIPTOR["cron"]` and
  implement it as a `POST /cron/<id>` endpoint. The Sensolus platform
  invokes it on schedule and supplies the API key via `X-Sensolus-Auth`.
  Use this when the app needs to iterate over multiple orgs or run in a
  different container than the web tier.

The template's `POST /cron/collect-org-stats` is a reference implementation:
it fans out over all reachable orgs and snapshots tracker/user counts into
`org_daily_stat` (idempotent per day via an `on_conflict_do_update`).

## Realtime

`flask-socketio` is initialised in `app.py` (`async_mode='threading'`,
`cors_allowed_origins="*"`). Emit events from your Python code; connect from
the frontend via `socket.io-client` — the same-origin default matches the
Flask host.

## Deployment

Multi-stage Dockerfile:

1. `node:20-slim` — installs from `frontend/package.json` and runs `npm run
   build` → `frontend/dist/`.
2. `python:3.12-slim` — installs `backend/requirements.txt`, copies
   `backend/` and the built `frontend/dist/`, runs as non-root user, launches
   `python backend/app.py`.

The `Jenkinsfile` builds the image and pushes to ECR
(`331708581843.dkr.ecr.eu-west-1.amazonaws.com/<app-name>`). Run
`scripts/create-ecr-repo.sh` once to bootstrap the ECR repo before the first
Jenkins build.

## Rules of the road

The kit under `@sensolus/snt-agent-kit` is locked — apps **import** from it,
never copy widget source in. ESLint in the generated app enforces:

- no deep imports (`@sensolus/snt-agent-kit/dist/...`, etc.), except
  `theme.css`;
- no re-declaring `Snt*` components in app code.

Customization goes through kit slots/render props, or a PR to the kit repo.
App-owned translation keys go in `frontend/src/i18n/translations/` and are
merged via `<LocaleProvider messages={...}>`.

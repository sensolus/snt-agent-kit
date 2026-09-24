"""
Database initialization.

app.py calls `ensure_database()` and `run_migrations(app)` at import, so the
container needs no separate init step. Running this file directly
(`python init_db.py`) does the same by hand.
"""
import os
import sys
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Ensure backend/ is on the path
sys.path.insert(0, os.path.dirname(__file__))

from db_config import get_database_uri
from sqlalchemy import create_engine, text


def ensure_database():
    uri = get_database_uri()
    db_name = os.getenv('DB_NAME', '{{APP_NAME}}')

    # Connect to 'postgres' maintenance DB to check/create ours
    maintenance_uri = uri.rsplit('/', 1)[0] + '/postgres'
    engine = create_engine(maintenance_uri, isolation_level='AUTOCOMMIT')
    with engine.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"),
            {'name': db_name}
        ).fetchone()
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{db_name}"'))
            logger.info(f"Created database '{db_name}'")
        else:
            logger.info(f"Database '{db_name}' already exists")
    engine.dispose()


def run_migrations(app=None):
    """Apply pending migrations.

    Pass the Flask app in. Falling back to `from app import app` re-imports
    app.py, and when app.py is also the entry point that is a SECOND import
    under a different module name — every module-level statement runs again.
    The fallback is kept only for `python init_db.py`, where nothing else has
    built an app yet.
    """
    from flask_migrate import upgrade

    if app is None:
        from app import app as app_from_module
        app = app_from_module

    with app.app_context():
        logger.info("Running database migrations...")
        upgrade()
        logger.info("Database migrations complete")


if __name__ == '__main__':
    ensure_database()
    run_migrations()

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
from sqlalchemy.exc import OperationalError


def ensure_database():
    """Make sure the app's own database exists.

    On the platform the agent manager has already created it, and the app may not
    connect to the 'postgres' maintenance database, so the app's own database is
    tried first. Only when it does not exist yet, as on a fresh local Postgres, is
    it created through 'postgres'.
    """
    uri = get_database_uri()
    db_name = os.getenv('DB_NAME', '{{APP_NAME}}')

    engine = create_engine(uri)
    try:
        with engine.connect():
            logger.info(f"Database '{db_name}' already exists")
            return
    except OperationalError as e:
        if 'does not exist' not in str(e):
            raise
    finally:
        engine.dispose()

    maintenance_uri = uri.rsplit('/', 1)[0] + '/postgres'
    engine = create_engine(maintenance_uri, isolation_level='AUTOCOMMIT')
    with engine.connect() as conn:
        conn.execute(text(f'CREATE DATABASE "{db_name}"'))
        logger.info(f"Created database '{db_name}'")
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

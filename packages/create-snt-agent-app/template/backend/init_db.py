"""
Database initialization script.
Run before starting gunicorn to ensure the database exists and migrations are applied.
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


def repair_dirty_state():
    """One-time fix: drop dirty tables left by failed migration races."""
    uri = get_database_uri()
    engine = create_engine(uri, isolation_level='AUTOCOMMIT')
    with engine.connect() as conn:
        tables = [row[0] for row in conn.execute(
            text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
        )]
        if 'favourite_organisations' in tables and 'alembic_version' in tables:
            # Check if alembic is stuck on a revision that no longer exists (e.g. 002 was removed)
            row = conn.execute(text("SELECT version_num FROM alembic_version")).fetchone()
            if row and row[0] not in ('001',):
                logger.info(f"Repairing dirty alembic state (stuck at {row[0]})...")
                conn.execute(text("DROP TABLE IF EXISTS favourite_organisations CASCADE"))
                conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
                logger.info("Cleaned up — migrations will re-run from scratch")
    engine.dispose()


def run_migrations():
    from app import app
    from flask_migrate import upgrade

    with app.app_context():
        logger.info("Running database migrations...")
        upgrade()
        logger.info("Database migrations complete")


if __name__ == '__main__':
    ensure_database()
    repair_dirty_state()
    run_migrations()

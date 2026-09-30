import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env file from project root
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)


def get_database_uri():
    host = os.getenv('DB_HOST', 'localhost')
    port = os.getenv('DB_PORT', '5432')
    db = os.getenv('DB_NAME', '{{APP_NAME}}')
    user = os.getenv('DB_USER', 'snt')
    password = os.getenv('DB_PASSWORD', 'snt')
    # The driver is named on purpose: from SQLAlchemy 2.1 a bare postgresql:// URL means
    # psycopg (v3), and requirements.txt installs psycopg2.
    return f'postgresql+psycopg2://{user}:{password}@{host}:{port}/{db}'

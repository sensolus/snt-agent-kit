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
    return f'postgresql://{user}:{password}@{host}:{port}/{db}'

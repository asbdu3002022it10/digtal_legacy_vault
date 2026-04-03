import sqlalchemy
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql+psycopg2://postgres:diwakar@localhost:5432/postgres"

def clean_db():
    engine = create_engine(DATABASE_URL, isolation_level="AUTOCOMMIT")
    with engine.connect() as conn:
        try:
            # Terminate active connections to the db
            conn.execute(text("SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'digital_legacy_vault' AND pid <> pg_backend_pid();"))
            conn.execute(text("DROP DATABASE IF EXISTS digital_legacy_vault"))
            print("Database dropped!")
            conn.execute(text("CREATE DATABASE digital_legacy_vault"))
            print("Database recreated!")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    clean_db()

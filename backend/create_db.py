import sqlalchemy
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql+psycopg2://postgres:diwakar@localhost:5432/postgres"

def create_db():
    engine = create_engine(DATABASE_URL, isolation_level="AUTOCOMMIT")
    with engine.connect() as conn:
        try:
            conn.execute(text("CREATE DATABASE digital_legacy_vault"))
            print("Database created!")
        except Exception as e:
            if "already exists" in str(e):
                print("Database already exists.")
            else:
                print(f"Error: {e}")

if __name__ == "__main__":
    create_db()

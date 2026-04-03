from sqlalchemy import create_engine, text
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.core.config import get_settings

settings = get_settings()
engine = create_engine(settings.DATABASE_URL)

def run_migration():
    with engine.connect() as conn:
        print("Migrating users table...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0 NOT NULL;"))
            print("  Added column: failed_login_attempts")
        except Exception as e:
            print(f"  Column likely already exists or error: {e}")
        conn.commit()
        print("Done!")

if __name__ == "__main__":
    run_migration()

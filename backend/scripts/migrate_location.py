from sqlalchemy import create_engine, text
from app.core.config import get_settings

settings = get_settings()
engine = create_engine(settings.DATABASE_URL)

def migrate_location():
    with engine.connect() as conn:
        print("Adding location columns to audit_logs...")
        try:
            conn.execute(text("ALTER TABLE audit_logs ADD COLUMN country VARCHAR;"))
            conn.execute(text("ALTER TABLE audit_logs ADD COLUMN state VARCHAR;"))
            conn.execute(text("ALTER TABLE audit_logs ADD COLUMN district VARCHAR;"))
            conn.commit()
            print("Location columns added successfully!")
        except Exception as e:
            print(f"Migration error: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate_location()

from sqlalchemy import create_engine, text
from app.core.config import get_settings

settings = get_settings()
engine = create_engine(settings.DATABASE_URL)

def migrate_dob():
    with engine.connect() as conn:
        print("Starting migrations...")
        try:
            # Add dob to users
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS dob VARCHAR"))
            print("Added dob to users")
            
            conn.commit()
            print("Migrations completed successfully!")
        except Exception as e:
            print(f"Migration error: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate_dob()

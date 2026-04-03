from sqlalchemy import create_engine, text
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.core.config import get_settings

settings = get_settings()
engine = create_engine(settings.DATABASE_URL)

def migrate_nominee_v2():
    with engine.connect() as conn:
        print("Migrating nominees table...")
        columns_to_add = [
            ("name", "VARCHAR"),
            ("relationship", "VARCHAR"),
            ("acceptance_token", "VARCHAR"),
            ("allowed_categories", "VARCHAR"),
            ("instructions", "TEXT"),
            ("accepted_at", "TIMESTAMP"),
        ]
        for col, col_type in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE nominees ADD COLUMN {col} {col_type};"))
                print(f"  Added column: {col}")
            except Exception as e:
                print(f"  Column {col} may already exist or error: {e}")
        
        conn.commit()
        print("Migration completed!")

if __name__ == "__main__":
    migrate_nominee_v2()

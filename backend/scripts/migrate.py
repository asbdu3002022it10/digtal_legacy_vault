from sqlalchemy import create_engine, text
from app.core.config import get_settings

settings = get_settings()
engine = create_engine(settings.DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        print("Starting migrations...")
        try:
            # Add last_login_at to users
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            print("Added last_login_at to users")
            
            # Add category to vault_items
            conn.execute(text("ALTER TABLE vault_items ADD COLUMN IF NOT EXISTS category VARCHAR DEFAULT 'general'"))
            print("Added category to vault_items")
            
            # Add file_path to vault_items
            conn.execute(text("ALTER TABLE vault_items ADD COLUMN IF NOT EXISTS file_path VARCHAR"))
            print("Added file_path to vault_items")
            
            # Make encrypted_payload optional in vault_items
            conn.execute(text("ALTER TABLE vault_items ALTER COLUMN encrypted_payload DROP NOT NULL"))
            print("Updated encrypted_payload to nullable")
            
            conn.commit()
            print("Migrations completed successfully!")
        except Exception as e:
            print(f"Migration error: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate()

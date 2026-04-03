import sys
import os
from sqlalchemy import text

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine

def migrate_audit_logs():
    print("Checking audit_logs table columns...")
    with engine.connect() as conn:
        try:
            # Columns added in newer version of AuditLog
            columns = [
                ("ip_address", "TEXT"),
                ("country", "TEXT"),
                ("state", "TEXT"),
                ("district", "TEXT")
            ]
            
            for col_name, col_type in columns:
                try:
                    conn.execute(text(f"ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
                    print(f"Column '{col_name}' checked/added.")
                except Exception as e:
                    print(f"Error check/add {col_name}: {e}")
            
            conn.commit()
            print("AuditLog migration complete.")
        except Exception as e:
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate_audit_logs()

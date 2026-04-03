import sys
import os
from sqlalchemy import text

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine

def migrate_security_questions():
    print("Connecting to database...")
    with engine.connect() as conn:
        try:
            print("Adding webauthn and security question columns to users table...")
            
            # List of columns to add
            columns = [
                ("webauthn_challenge", "TEXT"),
                ("sec_q1", "TEXT"),
                ("sec_a1", "TEXT"),
                ("sec_q2", "TEXT"),
                ("sec_a2", "TEXT"),
                ("sec_q3", "TEXT"),
                ("sec_a3", "TEXT")
            ]
            
            for col_name, col_type in columns:
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
                    print(f"Column '{col_name}' added successfully.")
                except Exception as e:
                    print(f"Error adding column {col_name}: {e}")
            
            conn.commit()
            print("All columns checked/added successfully.")
        except Exception as e:
            print(f"Error migrating table: {e}")

if __name__ == "__main__":
    migrate_security_questions()

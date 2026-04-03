from datetime import datetime

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User


def run_proof_of_life_check(db: Session) -> None:
    users = db.query(User).all()
    now = datetime.utcnow().isoformat()
    for user in users:
        # Placeholder: in a real implementation, send an email or notification.
        print(f"[{now}] Proof-of-life check for user {user.id} <{user.email}>")


def main() -> None:
    db = SessionLocal()
    try:
        run_proof_of_life_check(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()


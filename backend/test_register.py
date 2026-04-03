from app.db.session import SessionLocal, engine
from app.models.user import User
from app.core.security import get_password_hash

def test():
    print(f"Using Engine URL: {engine.url}")
    db = SessionLocal()
    try:
        user = User(
            email="test@example.com",
            hashed_password=get_password_hash("password")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Success! User id: {user.id}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test()

from app.db.base import Base
from app.db.session import engine
from app.models import user, vault, nominee

def create_all():
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Done!")

if __name__ == "__main__":
    create_all()

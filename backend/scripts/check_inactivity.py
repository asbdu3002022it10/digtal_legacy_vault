import sys
import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import get_settings
from app.models.user import User
from app.models.nominee import Nominee
from app.core.email import send_otp_email # Reusing email function for alerts

settings = get_settings()
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_inactivity():
    db = SessionLocal()
    try:
        # Define inactivity threshold (6 months)
        threshold = datetime.utcnow() - timedelta(days=180)
        
        # Find users who were last active before the threshold
        inactive_users = db.query(User).filter(User.last_login_at < threshold).all()
        
        for user in inactive_users:
            # Find nominees for this user
            nominees = db.query(Nominee).filter(Nominee.user_id == user.id).all()
            
            for nominee in nominees:
                if not nominee.can_access:
                    print(f"Activating access for nominee {nominee.email} due to user {user.email} inactivity.")
                    nominee.can_access = True
                    nominee.status = "activated"
                    
                    # Notify nominee
                    message = (
                        f"Hello, you have been designated as a nominee for {user.email} in the Digital Vault. "
                        f"Due to prolonged inactivity, you now have emergency access to their vault items. "
                        f"Please log in to the Digital Vault using your email: {nominee.email} to view the shared data. "
                        f"Note: Secure files require the user's Date of Birth to open."
                    )
                    try:
                        send_otp_email(nominee.email, message)
                    except Exception as e:
                        print(f"Failed to send email to nominee: {e}")
            
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    check_inactivity()

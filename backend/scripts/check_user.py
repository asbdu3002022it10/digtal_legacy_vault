import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db.session import SessionLocal
from app.models.user import User

db = SessionLocal()
user = db.query(User).filter(User.email == 'diwakar.izonetech@gmail.com').first()
if user:
    print('USER FOUND')
    print('OTP:', user.otp)
    print('Q1:', user.sec_q1)
else:
    print('USER NOT FOUND')

import requests
import time

BASE_URL = "http://localhost:8000/api"
EMAIL = "test_setup@example.com"
DOB = "12121990"

def test_full_setup_flow():
    print("--- 1. Request OTP ---")
    resp = requests.post(f"{BASE_URL}/auth/request-otp", json={"email": EMAIL, "dob": DOB})
    print("Status:", resp.status_code)
    print("Response:", resp.json())
    
    if resp.status_code != 200:
        return

    # In our app, OTP is sent to email. For testing, we need to grab it from DB.
    # But since I can't easily wait for DB here, I'll use a script to get it.
    print("\n--- 2. Fetch OTP from DB ---")
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from app.db.session import SessionLocal
    from app.models.user import User
    
    db = SessionLocal()
    user = db.query(User).filter(User.email == EMAIL).first()
    otp = user.otp
    print("OTP found in DB:", otp)
    db.close()

    if not otp:
        print("Failed to get OTP from DB")
        return

    print("\n--- 3. Verify OTP ---")
    resp = requests.post(f"{BASE_URL}/auth/verify-otp", json={"email": EMAIL, "otp": otp})
    print("Status:", resp.status_code)
    print("Response:", resp.json())
    
    if resp.status_code != 200:
        return

    print("\n--- 4. Setup Security Questions ---")
    setup_data = {
        "email": EMAIL,
        "otp": otp,
        "q1": "Color?", "a1": "Green",
        "q2": "City?", "a2": "Chennai",
        "q3": "Code?", "a3": "123"
    }
    resp = requests.post(f"{BASE_URL}/auth/setup-security", json=setup_data)
    print("Status:", resp.status_code)
    print("Response:", resp.json())
    
    if resp.status_code == 200:
        print("\nSUCCESS! Flow completed.")
    else:
        print("\nFAILED at Setup Questions.")

if __name__ == "__main__":
    test_full_setup_flow()

import requests
import sqlalchemy

r1 = requests.post('http://localhost:8000/api/auth/request-otp', json={'email':'test2@example.com'})
print(r1.text)

engine = sqlalchemy.create_engine('postgresql+psycopg2://postgres:diwakar@localhost:5432/digital_legacy_vault')
with engine.connect() as conn:
    res = conn.execute(sqlalchemy.text("SELECT otp FROM users WHERE email='test2@example.com'"))
    otp = res.fetchone()[0]

print("Found OTP:", otp)

r2 = requests.post('http://localhost:8000/api/auth/verify-otp', json={'email':'test2@example.com', 'otp':otp})
print(r2.text)

import sqlalchemy
engine = sqlalchemy.create_engine('postgresql+psycopg2://postgres:diwakar@localhost:5432/digital_legacy_vault')
with engine.connect() as conn:
    conn.execute(sqlalchemy.text("DELETE FROM users"))
    conn.commit()
print("Purged users table.")

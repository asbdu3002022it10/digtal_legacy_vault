# Digital Legacy Vault

Secure full-stack demo for storing encrypted secrets and configuring a nominee for future access.

## Backend (FastAPI)

### Prerequisites

- Python 3.11+
- PostgreSQL running and accessible

### Setup

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

3. Create a `.env` file in `backend/`:

```bash
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/digital_legacy_vault
SECRET_KEY=change-me-to-a-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

4. Run Alembic migrations (after adding migration scripts as needed):

```bash
cd backend
alembic upgrade head
```

5. Start the API:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

## Frontend (React + Vite + Tailwind)

### Setup

1. Install Node.js 18+.
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Start the dev server:

```bash
npm run dev
```

The app will run on `http://localhost:5173` and talk to the backend at `http://localhost:8000/api`.

## Key flows

- **Auth**: Email/password login and registration (`/api/auth/*`) with JWT stored in `localStorage` and attached to all API calls.
- **Vault**: Encrypted vault items (`/api/vault/*`) where plaintext is encrypted server-side before being stored.
- **Nominee**: Basic nominee configuration (`/api/nominee/*`) to designate a contact for future access; cron worker stub exists in `app/worker/cron.py` for a daily proof-of-life check.


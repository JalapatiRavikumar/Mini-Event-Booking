# Mini Event Booking System

Production-ready event booking solution with a Node.js backend and a separate React frontend.

## Tech Stack

- Node.js + Express.js
- MySQL (`mysql2/promise`)
- dotenv
- OpenAPI (Swagger UI)

## Project Structure

```text
backend/
  src/
    controllers/
    models/
    routes/
    db/
    utils/
  schema.sql
  seed.sql

frontend/
  src/
```

## Setup (Local)

1. Install dependencies:

```bash
cd backend
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

Recommended backend env values for local:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=system
DB_NAME=event_booking
DB_CONNECTION_LIMIT=10
CORS_ALLOWED_ORIGINS=http://localhost:5173
ENABLE_DEMO_SEED=true
```

3. Create schema in MySQL:

```bash
mysql -u root -p < schema.sql
```

4. (Optional) Seed sample data:

```bash
npm run db:seed
```

5. Start backend server:

```bash
npm run dev
```

Server: `http://localhost:3000`

Swagger docs: `http://localhost:3000/docs`

## Frontend (Separate App)

The frontend lives in `frontend/` and runs independently from the backend.

1. Copy frontend env:

```bash
cd frontend
cp .env.example .env
```

2. Install frontend dependencies:

```bash
npm install
```

3. Start frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

Make sure `VITE_API_BASE_URL` in `frontend/.env` points to your backend (default `http://localhost:3000`).

For local frontend, use:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Setup (Docker)

```bash
docker compose up --build
```

This starts:
- App on `http://localhost:3000`
- MySQL on `localhost:3306`

## Deployment Checklist

1. Backend env (`backend/.env` or platform env vars):
   - `PORT=3000` (or your platform-assigned port)
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com`
   - `ENABLE_DEMO_SEED=false`
2. Frontend env:
   - `VITE_API_BASE_URL=https://your-backend-domain.com`
3. Restart backend after changing env vars.
4. Verify:
   - `GET /health`
   - `GET /events`
   - one full booking + attendance flow

## API Endpoints

- `GET /events` - list upcoming events with remaining tickets
- `POST /events` - create event
- `POST /bookings` - create booking with transaction and row locking
- `GET /users/:id/bookings` - list user bookings including event details
- `POST /events/:id/attendance` - mark attendance using booking code

## Transaction and Race Condition Safety

`POST /bookings` uses:

- `BEGIN` / `COMMIT` / `ROLLBACK`
- `SELECT ... FOR UPDATE` on event row
- safe decrement of `remaining_tickets`
- unique `booking_code` with retry handling for duplicate key collisions

This prevents overbooking under concurrent requests.

## Error Handling

- `400` for validation errors and sold-out events
- `404` for missing users/events/bookings
- `500` for server/database errors

## Schema

See `backend/schema.sql` for:
- foreign keys
- unique constraints
- indexes (`bookings.user_id`, `bookings.event_id`)
- integrity checks on capacities

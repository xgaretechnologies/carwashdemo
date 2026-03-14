# 🚿 VernonAutoDetailing — Fullstack Car Wash Management

React + Vite frontend · Node.js + Express backend · PostgreSQL database

---

## 📁 Structure

```
VernonAutoDetailing-fullstack/
├── package.json            ← root scripts (runs both with concurrently)
├── server/
│   ├── index.js            ← Express entry point
│   ├── db.js               ← pg pool, schema creation, seed data
│   ├── .env.example        ← copy to .env and fill in
│   ├── middleware/
│   │   └── auth.js         ← JWT verify + managerOnly guard
│   └── routes/
│       ├── auth.js         ← POST /api/auth/login, GET /api/auth/me
│       ├── bookings.js     ← full CRUD + PATCH status
│       └── employees.js    ← full CRUD + PATCH status (manager-only writes)
└── client/
    ├── vite.config.js      ← dev proxy /api → localhost:5000
    └── src/
        ├── api.js          ← centralised fetch client (token from localStorage)
        ├── data.js         ← UI constants only (no seed data)
        ├── App.jsx         ← shared state, login, API mutations
        └── components/
            ├── LoginModal        ← async login with server error display
            ├── Dashboard         ← sidebar shell, role-based nav
            ├── BookingsScreen    ← date strip, filters, status actions, edit
            ├── ScheduleScreen    ← slot grid, detail panel, click-to-book
            ├── EmployeesScreen   ← staff list, add/edit/delete (manager only)
            └── BookingModal      ← shared create/edit form with slot picker
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally

### 2. Create the database
```sql
CREATE DATABASE VernonAutoDetailing;
```

### 3. Configure environment
```bash
cp server/.env.example server/.env
# Edit server/.env — set DB_PASSWORD (and other values if needed)
```

### 4. Install dependencies
```bash
npm run install:all
```

### 5. Start development servers
```bash
npm run dev
# Starts backend on :5000 and frontend on :5173 simultaneously
```

The database schema is created and seeded automatically on first start.

---

## 🔑 Login Credentials

| Username | Password  | Role    |
|----------|-----------|---------|
| manager  | shine123  | Manager |
| staff01  | aqua2026  | Staff   |
| staff02  | aqua2026  | Staff   |
| alex     | wash2026  | Staff   |

---

## 🔌 API Reference

All routes (except `/api/auth/login`) require `Authorization: Bearer <token>`.

### Auth
| Method | Path            | Body / Params           | Response         |
|--------|-----------------|-------------------------|------------------|
| POST   | /api/auth/login | `{username, password}`  | `{token, user}`  |
| GET    | /api/auth/me    | —                       | `{user}`         |

### Bookings
| Method | Path                         | Notes                              |
|--------|------------------------------|------------------------------------|
| GET    | /api/bookings                | `?date=YYYY-MM-DD&status=pending`  |
| GET    | /api/bookings/:id            | Single booking                     |
| POST   | /api/bookings                | Creates booking, checks slot conflict |
| PUT    | /api/bookings/:id            | Full update, checks slot conflict  |
| PATCH  | /api/bookings/:id/status     | `{status}` quick update            |
| DELETE | /api/bookings/:id            | Hard delete                        |

### Employees *(writes require Manager role)*
| Method | Path                         | Notes                          |
|--------|------------------------------|--------------------------------|
| GET    | /api/employees               | `?search=name&status=active`   |
| GET    | /api/employees/:id           | Single employee                |
| POST   | /api/employees               | Manager only                   |
| PUT    | /api/employees/:id           | Manager only                   |
| PATCH  | /api/employees/:id/status    | Manager only, `{status}`       |
| DELETE | /api/employees/:id           | Manager only                   |

### Health
```
GET /api/health  →  { status: "ok", time: "..." }
```

---

## 🏗️ Production Build

```bash
# Build the React client
npm run build

# Set NODE_ENV=production in server/.env, then:
cd server && node index.js
# Express serves the built client from client/dist
```

---

## 🔒 Security Notes

- Passwords stored as bcrypt hashes (cost factor 10)
- JWT tokens expire after 12 hours
- Manager-only endpoints protected by `managerOnly` middleware
- Slot conflict detection prevents double-booking at DB level
- CORS restricted to `CLIENT_URL` env variable

# Blitzkreig Chess Club VNIT — Web Application

Full-stack web application for the Blitzkreig Chess Club at VNIT Nagpur.

---

## Project Structure

```
Blitzkreig Website/
├── blitzkreig-frontend/   # React + Vite + Tailwind CSS
└── blitzkreig-backend/    # Node.js + Express + PostgreSQL (Prisma)
```

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| PostgreSQL | ≥ 14 |

---

### 1. Backend Setup

```bash
cd blitzkreig-backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed the database (creates admin user + sample events)
npm run prisma:seed

# Start the dev server
npm run dev
# API running at http://localhost:4000
```

**Default admin credentials (after seed):**
- Username: `admin`
- Password: `Admin@1234`
- ⚠️ Change this immediately in production.

---

### 2. Frontend Setup

```bash
cd blitzkreig-frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
# App running at http://localhost:5173
```

The Vite dev server is pre-configured to proxy `/api/*` requests to the backend on port 4000.

---

## API Reference

### Authentication

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/login` | Public | Login, returns JWT |
| `GET`  | `/api/auth/me`    | Bearer | Current user profile |

#### POST /api/auth/login

```json
// Request body
{ "username": "admin", "password": "Admin@1234" }

// Response
{ "token": "<jwt>", "user": { "id": 1, "username": "admin", "role": "SUPER_ADMIN" } }
```

---

### Events

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET`    | `/api/events`     | Public | List all published events |
| `GET`    | `/api/events/:id` | Public | Get single event |
| `POST`   | `/api/events`     | Admin  | Create new event |
| `PATCH`  | `/api/events/:id` | Admin  | Update event |
| `DELETE` | `/api/events/:id` | Admin  | Delete event |

#### GET /api/events query params

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Filter by title/description |
| `page` | int | Page number (default: 1) |
| `limit` | int | Results per page (default: 20, max: 100) |

#### POST/PATCH /api/events body

```json
{
  "title": "Spring Tournament 2025",
  "date": "2025-03-15T10:00:00Z",
  "description": "Annual spring rapid chess tournament.",
  "image_url": "https://example.com/image.jpg",
  "is_published": true
}
```

Use the JWT from login in the `Authorization: Bearer <token>` header for protected routes.

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `bg-slate-900` | `#0f172a` | Page background |
| `text-slate-100` | `#f1f5f9` | Body text |
| `vnit-blue` | `#1A56DB` | Primary accent |
| `vnit-gold` | `#EAB308` | Secondary accent |

---

## Database Schema

```
User
 ├─ id            Int           (PK, auto)
 ├─ username      String        (unique)
 ├─ password_hash String        (bcrypt, rounds=12)
 ├─ role          Role          (ADMIN | SUPER_ADMIN)
 └─ created_at    DateTime

Event
 ├─ id            Int           (PK, auto)
 ├─ title         String
 ├─ date          DateTime
 ├─ description   String (text)
 ├─ image_url     String?
 ├─ is_published  Boolean       (default: true)
 ├─ created_by    Int?          (FK → User)
 └─ created_at    DateTime
```

---

## Available Scripts

### Frontend (`blitzkreig-frontend/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

### Backend (`blitzkreig-backend/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with nodemon |
| `npm start` | Start production server |
| `npm run prisma:migrate` | Apply Prisma migrations |
| `npm run prisma:studio` | Open Prisma Studio UI |
| `npm run prisma:seed` | Seed the database |

---

## Security Notes

- Passwords are hashed with **bcrypt** (12 salt rounds)
- JWTs expire after **8 hours** by default
- Login is rate-limited to **10 attempts per 15 minutes**
- All routes use **Helmet** security headers
- Global rate limiter: **200 req / 15 min**
- Constant-time comparison on login (username enumeration prevention)

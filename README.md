# Blitzkrieg Website

Production-ready full-stack website for Blitzkrieg Chess Club VNIT.

This project now runs fully on JSON storage (no Prisma, no SQL database).

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Storage: JSON files in `blitzkrieg-backend/data`
- Auth: JWT

## Folder Layout

```text
Blitzkrieg Website/
  blitzkrieg-frontend/
  blitzkrieg-backend/
```

## Prerequisites

- Node.js 18+
- npm 9+

## Environment Configuration

### Backend: `blitzkrieg-backend/.env`

Required variables:

```env
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=8h
RESEND_API_KEY=your_resend_api_key
CLUB_EMAIL=blitzkriegchessclub@gmail.com
```

### Frontend: `blitzkrieg-frontend/.env.local`

```env
VITE_YOUTUBE_API_KEY=your_youtube_data_api_key
VITE_YOUTUBE_HANDLE=BlitzkriegVNIT
```

### Default Admin Login

The JSON seed includes one initial admin account:

- Username: `admin`
- Password: `Blitzkrieg@123`

Change it after the first login.

## Local Development

Open 2 terminals.

### Terminal 1 (Backend)

```bash
cd blitzkrieg-backend
npm install
npm run dev
```

Backend runs at `http://localhost:4000`.

### Terminal 2 (Frontend)

```bash
cd blitzkrieg-frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Production Build and Run

### 1) Install dependencies

```bash
cd blitzkrieg-backend && npm ci
cd ../blitzkrieg-frontend && npm ci
```

### 2) Build frontend

```bash
cd blitzkrieg-frontend
npm run build
```

### 3) Run backend in production mode

```bash
cd blitzkrieg-backend
NODE_ENV=production npm start
```

### 4) Serve frontend

Serve `blitzkrieg-frontend/dist` with Nginx, Apache, or any static hosting service.

## Deployment Notes

- Store environment secrets on the server, never in git.
- Keep `JWT_SECRET` strong and unique.
- Set `CORS_ORIGIN` to your real frontend domain.
- Ensure `blitzkrieg-backend/public/uploads` is writable.
- Back up JSON data files regularly:
  - `blitzkrieg-backend/data/events.json`
  - `blitzkrieg-backend/data/committee.json`
  - `blitzkrieg-backend/data/users.json`
  - `blitzkrieg-backend/data/contactMessages.json`

## Useful Commands

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
```

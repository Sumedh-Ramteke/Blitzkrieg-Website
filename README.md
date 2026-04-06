# Blitzkrieg Website

Production-ready full-stack website for Blitzkrieg Chess Club VNIT.

This project now runs fully on JSON storage (no Prisma, no SQL database).

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Storage: JSON files in `blitzkreig-backend/data`
- Auth: JWT

## Folder Layout

```text
Blitzkrieg Website/
  blitzkreig-frontend/
  blitzkreig-backend/
```

## Prerequisites

- Node.js 18+
- npm 9+

## Environment Configuration

### Backend: `blitzkreig-backend/.env`

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

### Frontend: `blitzkreig-frontend/.env.local`

```env
VITE_YOUTUBE_API_KEY=your_youtube_data_api_key
VITE_YOUTUBE_HANDLE=BlitzkriegVNIT
```

## Local Development

Open 2 terminals.

### Terminal 1 (Backend)

```bash
cd blitzkreig-backend
npm install
npm run dev
```

Backend runs at `http://localhost:4000`.

### Terminal 2 (Frontend)

```bash
cd blitzkreig-frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Production Build and Run

### 1) Install dependencies

```bash
cd blitzkreig-backend && npm ci
cd ../blitzkreig-frontend && npm ci
```

### 2) Build frontend

```bash
cd blitzkreig-frontend
npm run build
```

### 3) Run backend in production mode

```bash
cd blitzkreig-backend
NODE_ENV=production npm start
```

### 4) Serve frontend

Serve `blitzkreig-frontend/dist` with Nginx, Apache, or any static hosting service.

## Deployment Notes

- Store environment secrets on the server, never in git.
- Keep `JWT_SECRET` strong and unique.
- Set `CORS_ORIGIN` to your real frontend domain.
- Ensure `blitzkreig-backend/public/uploads` is writable.
- Back up JSON data files regularly:
  - `blitzkreig-backend/data/events.json`
  - `blitzkreig-backend/data/committee.json`
  - `blitzkreig-backend/data/users.json`
  - `blitzkreig-backend/data/contactMessages.json`

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

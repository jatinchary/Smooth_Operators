# Smooth_Operators

Full‑stack template: React (Vite) frontend + Node.js/Express backend.

## Prerequisites

- Node.js 18+ and npm

## Project structure

```
client/   → React app (Vite)
server/   → Express API
```

## Quick start

Open two terminals (one for API, one for Web).

1) API

```
cd server
npm install
# create a .env file with (adjust as needed):
# PORT=4000
# CORS_ORIGIN=http://localhost:5173
npm run dev
```

2) Web

```
cd client
npm install
# optionally create .env with:
# VITE_API_BASE_URL=http://localhost:4000
npm run dev
```

- Web app: `http://localhost:5173`

## Environment variables

- Server (`server/`):
  - `PORT` (default `4000`)
  - `CORS_ORIGIN` (default `http://localhost:5173`)
- Client (`client/`):
  - `VITE_API_BASE_URL` (default `http://localhost:4000`)

Sample env files are provided:

- `server/env.example` → copy to `server/.env`
- `client/env.example` → copy to `client/.env`

## Security notes

- No secrets committed; `.env` is gitignored.
- CORS origin is restricted; tune `CORS_ORIGIN` per environment.
- Common security headers applied via `helmet` (customize CSP as needed).
- Do not log PII or secrets.

## Scripts (reference)

- `server/`
  - `npm run dev` → start API with watch (Node 18+)
  - `npm start` → start API
- `client/`
  - `npm run dev` → start Vite dev server
  - `npm run build` → production build
  - `npm run preview` → preview build


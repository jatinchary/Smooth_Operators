# Server (Node.js + Express)

This is a minimal Express API.

## Scripts

- `npm run dev`: start API with file watching (Node 18+)
- `npm start`: start API

## Environment

Set via a `.env` file (not committed) or shell env:

- `PORT` (default: `4000`)
- `CORS_ORIGIN` (default: `http://localhost:5173`)

## Endpoints

- `GET /api/health` → `{ status: "ok", service: "api", timestamp }`

## Security

- Uses `helmet` for common security headers (CSP disabled by default; customize as needed)
- CORS restricted via `CORS_ORIGIN`
- Avoid logging PII or secrets

## Notes

- Add your routes under `src/` and mount them in `src/index.js`



# KICKS

AI-powered sneaker recommendation web app.

## Prerequisites

- Node.js 20.x LTS or newer

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts the Vite dev server (default: http://localhost:5173).

## Production build

```bash
npm run build
```

Outputs to `dist/`.

## Configuration

1. Copy the example env file and fill in real values locally:

```bash
cp .env.example .env.local
```

2. Never commit `.env`, `.env.local`, or other secret files (they are gitignored).
3. For Vercel production/preview, set the same variables in the project **Settings → Environment Variables** dashboard.
4. `VITE_` prefixed variables are exposed to the browser via Vite. Server-only keys (`GEMINI_API_KEY`, `SNEAKER_DB_API_KEY`, `SENTRY_DSN`) must not use the `VITE_` prefix.

Runtime helpers:

- `validateServerEnv()` — fail-fast for serverless handlers that require API keys
- `validateClientEnv()` — warns when client `VITE_` vars are missing (app still loads)

## Routes

| Path | Page |
| --- | --- |
| `/` | Home Page |
| `/results` | Results Page |
| `/comparison` | Comparison Page |

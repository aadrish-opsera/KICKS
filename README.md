# KICKS

AI-powered sneaker recommendation web app (ranking via Groq Chat Completions).

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
4. `VITE_` prefixed variables are exposed to the browser via Vite. Server-only keys (`GROQ_API_KEY`, `SNEAKER_DB_API_KEY`, `SENTRY_DSN`) must not use the `VITE_` prefix.
5. Set `GROQ_API_KEY` for AI ranking (optional legacy alias: `GEMINI_API_KEY`). Override the model with `GROQ_MODEL` if needed (default `llama-3.3-70b-versatile`).

Runtime helpers:

- `validateServerEnv()` — fail-fast for serverless handlers that require API keys
- `validateClientEnv()` — warns when client `VITE_` vars are missing (app still loads)

## Routes

| Path | Page |
| --- | --- |
| `/` | Home Page |
| `/results` | Results Page |
| `/comparison` | Comparison Page |

## End-to-end tests (Playwright)

```bash
npx playwright install
npm run test:e2e
```

E2E suites live in `e2e/` and mock `/api/recommend` via Playwright route interception (see `e2e/fixtures/`). Projects: Chromium, Firefox, WebKit, mobile Chrome (iPhone SE), and a custom 320px viewport.

Local smoke (Playwright library API, avoids hung CLI on some Windows setups):

```bash
npm run dev -- --host 127.0.0.1 --port 5173
npm run test:e2e:smoke
```

## Performance tests

NFRs: `/api/recommend` p50 ≤ 4s / p95 ≤ 8s (mocked APIs are lower), submit → results ≤ 6s, filter interactions ≤ 100ms, JS bundle ≤ 200KB gzip, Lighthouse TTI ≤ 3s on simulated 4G, Accessibility ≥ 90 / Performance ≥ 80 / Best Practices ≥ 80.

```bash
npm run test:perf:api
npm run build && npm run test:perf:bundle
npm run build && npm run test:perf:client
npm run build && npm run test:perf:lighthouse
# or after build: npm run test:perf  (api → bundle → client → lighthouse)
```

- `test:perf:api` — Vitest latency suite (`tests/performance/api-latency.test.ts`)
- `test:perf:client` — Playwright library runner (`scripts/run-perf-client.mjs`; avoids hung CLI)
- `test:perf:bundle` — gzipped JS budget under `dist/assets`
- `test:perf:lighthouse` — LHCI via `lighthouserc.cjs` (simulated 4G, 3 runs, median TTI ≤3s)
- `test:perf` — runs api + bundle + client + lighthouse sequentially (build first)

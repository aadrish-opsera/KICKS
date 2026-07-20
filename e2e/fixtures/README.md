# E2E fixtures (WO-149)

Mock JSON used by Playwright `page.route` handlers. No real calls to Groq, sneaker databases, or RapidAPI.

| File | Purpose |
| --- | --- |
| `mock-recommend-success.json` | Happy path — 5 ranked sneakers, `aiRankingAvailable: true` |
| `mock-recommend-degraded.json` | Degraded AI — 5 sneakers, null explanations, quota banner |
| `mock-recommend-error.json` | Error payload variants (`SNEAKER_API_UNAVAILABLE`, `GEMINI_API_UNAVAILABLE`, etc.) |

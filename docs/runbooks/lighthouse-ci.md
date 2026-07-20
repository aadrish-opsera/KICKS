# Lighthouse CI Runbook

## Overview

Lighthouse CI audits `/`, `/results`, and `/comparison` on every pull request to `main`.
Accessibility must score **>= 90**. Performance and Best Practices warn below **80**.

## How to run locally

```bash
npm run build
npm run lighthouse
```

This builds the app, starts Vite preview, runs 3 audits per page, and writes results to `.lighthouseci/`.

## Interpreting results

- Open the HTML reports under `.lighthouseci/`
- Focus on **Accessibility** category first (hard gate)
- Performance can fluctuate 3–5 points between runs; median of 3 runs reduces noise

## Common failures and fixes

| Issue | Fix |
|---|---|
| Missing image alt | Use `Image` / ensure every `img` has descriptive `alt` |
| Low contrast | Adjust tokens in `src/styles/tokens.css` to keep >= 4.5:1 |
| Touch targets < 44px | Use `Button` / `IconButton` / `--touch-target-min` |
| Heading skips | Keep a single `h1` per page, then `h2` sections |
| Links open new tab without name | Add aria-label like `Buy on StockX, opens in new tab` |

## Threshold policy

- Accessibility 0.9 is non-negotiable for MVP
- Performance / Best Practices 0.8 are guardrails; adjust only with product approval

## Escalation

If a PR is blocked by a flaky Lighthouse score:

1. Re-run the workflow once
2. Run locally and compare median scores
3. If still failing, open an issue with the `.lighthouseci` artifact attached

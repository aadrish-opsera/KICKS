# Production dependencies

Explicit approval record for production packages (WO-151).  
New production dependencies **over 50KB** (approximate install size in `node_modules`) require an entry here before merge.

Sizes are approximate uncompressed `node_modules` footprints (run `npm run audit:deps` for current numbers). Gzipped transfer size for the browser bundle is enforced separately via `npm run test:perf:bundle` (≤200KB).

| Package | Approx. size | Purpose / justification |
| --- | --- | --- |
| `react` | ~80KB+ | UI library (core). |
| `react-dom` | ~2MB+ | React DOM renderer — required for browser apps; vendor-chunked. |
| `react-router-dom` | ~200KB+ | Client routing for Home / Results / Comparison. |
| `lucide-react` | large (tree-shaken) | Icons; only imported icons ship in the app bundle. |
| `web-vitals` | ~10KB | Core Web Vitals reporting (LCP/INP/CLS) in development. |
| `@sentry/react` | large | Client error monitoring (Hobby-friendly). |
| `@sentry/node` | large | Serverless error monitoring for `/api/*`. |
| `@vercel/analytics` | small | Privacy-friendly usage analytics on Vercel. |

## Adding a new production dependency

1. Prefer alternatives under 50KB when possible.
2. If the package (or its install footprint) exceeds **50KB**, document it in the table above with purpose and why no lighter alternative works.
3. Run `npm run check:dep-approvals` (fails if any production dep >50KB is missing from this table).
4. Run `npm run audit:deps` and `npm run check:function-size` (serverless payload must stay under 5MB).
5. Run `npm run build && npm run test:perf:bundle` to keep frontend JS ≤200KB gzipped.

## Dev-only analysis tooling

| Package | Purpose |
| --- | --- |
| `rollup-plugin-visualizer` | On-demand bundle treemap via `npm run build:analyze` → `dist/stats.html` (gitignored). Committed summary: `artifacts/bundle-analysis.md`. |

#!/usr/bin/env node
/**
 * Snyk SCA wrapper: skip gracefully when SNYK_TOKEN is missing or quota/auth fails.
 */
import { spawnSync } from 'node:child_process'

const token = process.env.SNYK_TOKEN
if (!token) {
  console.warn('[snyk] SNYK_TOKEN not set — skipping Snyk SCA (npm audit remains the hard gate).')
  process.exit(0)
}

const result = spawnSync(
  'npx',
  ['--yes', 'snyk', 'test', '--severity-threshold=high', '--policy-path=.snyk'],
  {
    encoding: 'utf8',
    env: process.env,
    shell: true,
  },
)

if (result.stdout) {
  process.stdout.write(result.stdout)
}
if (result.stderr) {
  process.stderr.write(result.stderr)
}

const combined = `${result.stdout ?? ''}\n${result.stderr ?? ''}`
if (
  /authentication/i.test(combined) ||
  /quota/i.test(combined) ||
  /unauthorized/i.test(combined) ||
  result.status === 2
) {
  console.warn('[snyk] auth/quota issue — continuing with npm audit only.')
  process.exit(0)
}

process.exit(result.status ?? 1)

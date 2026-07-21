#!/usr/bin/env node
/**
 * Audit packages included in the serverless function payload (api/ runtime).
 * Lists sizes from node_modules and flags packages over 100KB for review.
 *
 * Frontend-only production deps (react, lucide-react, …) are excluded — they
 * are not packaged into Vercel /api functions.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const FLAG_BYTES = 100 * 1024
/** Keep in sync with scripts/check-function-size.mjs */
const SERVERLESS_RUNTIME_DEPS = ['@sentry/node']

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const nodeModules = join(root, 'node_modules')
const packageJsonPath = join(root, 'package.json')

function dirSizeBytes(dirPath) {
  if (!existsSync(dirPath)) return 0
  let total = 0
  const entries = readdirSync(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dirPath, entry.name)
    if (entry.isSymbolicLink()) continue
    if (entry.isDirectory()) {
      total += dirSizeBytes(full)
    } else if (entry.isFile()) {
      total += statSync(full).size
    }
  }
  return total
}

function packageDirName(name) {
  if (name.startsWith('@')) {
    const [scope, pkg] = name.split('/')
    return join(scope, pkg)
  }
  return name
}

function main() {
  if (!existsSync(nodeModules)) {
    console.error(
      'audit-function-deps: node_modules missing. Run npm install first.',
    )
    process.exit(1)
  }

  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const prodDeps = new Set(Object.keys(pkg.dependencies ?? {}))
  const missing = SERVERLESS_RUNTIME_DEPS.filter((name) => !prodDeps.has(name))
  if (missing.length) {
    console.error(
      `audit-function-deps: expected serverless deps missing from package.json: ${missing.join(', ')}`,
    )
    process.exit(1)
  }

  const rows = []
  for (const name of SERVERLESS_RUNTIME_DEPS) {
    const dir = join(nodeModules, packageDirName(name))
    const size = dirSizeBytes(dir)
    rows.push({ name, size, flagged: size > FLAG_BYTES })
  }

  rows.sort((a, b) => b.size - a.size)

  console.log('Serverless function dependency audit (runtime packages)\n')
  console.log('Package'.padEnd(36) + 'Size'.padStart(12) + '  Flag')
  console.log('-'.repeat(56))

  let total = 0
  for (const row of rows) {
    total += row.size
    const sizeLabel = `${(row.size / 1024).toFixed(1)} KiB`
    const flag = row.flagged ? '>100KB REVIEW' : ''
    console.log(
      row.name.padEnd(36) + sizeLabel.padStart(12) + (flag ? `  ${flag}` : ''),
    )
  }

  console.log('-'.repeat(56))
  console.log(
    `Total listed deps: ${(total / (1024 * 1024)).toFixed(2)} MiB (${rows.length} packages)`,
  )
  const flagged = rows.filter((r) => r.flagged)
  if (flagged.length) {
    console.log(
      `\nFlagged (>100KB): ${flagged.map((r) => r.name).join(', ')}`,
    )
  }
}

main()

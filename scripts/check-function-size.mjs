#!/usr/bin/env node
/**
 * Assert the serverless function payload stays under Vercel Hobby's 5MB
 * uncompressed guidance.
 *
 * Measures application code that ships with handlers (api/ + shared src used
 * by api) plus serverless runtime production deps — not the full frontend
 * node_modules tree (React, etc. are not packaged into /api functions).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const BUDGET_BYTES = 5 * 1024 * 1024
/** Production packages actually imported by api/ / server shared utils. */
const SERVERLESS_RUNTIME_DEPS = ['@sentry/node']

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const apiDir = join(root, 'api')
const sharedDirs = [
  join(root, 'src', 'services'),
  join(root, 'src', 'shared'),
]
const nodeModules = join(root, 'node_modules')

function dirSizeBytes(dirPath) {
  if (!existsSync(dirPath)) return 0
  let total = 0
  const entries = readdirSync(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dirPath, entry.name)
    if (entry.isSymbolicLink()) continue
    if (entry.isDirectory()) {
      // Skip unit tests under services/shared — not deployed.
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue
      total += dirSizeBytes(full)
    } else if (entry.isFile()) {
      if (/\.(test|spec)\.(ts|tsx|js|mjs)$/.test(entry.name)) continue
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
  if (!existsSync(apiDir)) {
    console.error('check-function-size: api/ directory not found.')
    process.exit(1)
  }
  if (!existsSync(nodeModules)) {
    console.error(
      'check-function-size: node_modules missing. Run npm install first.',
    )
    process.exit(1)
  }

  const apiSize = dirSizeBytes(apiDir)
  let sharedSize = 0
  for (const dir of sharedDirs) {
    sharedSize += dirSizeBytes(dir)
  }

  let depsSize = 0
  for (const name of SERVERLESS_RUNTIME_DEPS) {
    depsSize += dirSizeBytes(join(nodeModules, packageDirName(name)))
  }

  const total = apiSize + sharedSize + depsSize
  console.log(`api/ source: ${(apiSize / 1024).toFixed(1)} KiB`)
  console.log(`shared src (services+shared): ${(sharedSize / 1024).toFixed(1)} KiB`)
  console.log(
    `serverless runtime deps (${SERVERLESS_RUNTIME_DEPS.join(', ')}): ${(depsSize / (1024 * 1024)).toFixed(2)} MiB`,
  )
  console.log(
    `Total: ${(total / (1024 * 1024)).toFixed(2)} MiB (budget ${(BUDGET_BYTES / (1024 * 1024)).toFixed(0)} MiB)`,
  )

  if (total > BUDGET_BYTES) {
    console.error(
      `Function size check failed: ${total} bytes exceeds ${BUDGET_BYTES}.`,
    )
    process.exit(1)
  }

  console.log('Function size check passed.')
}

main()

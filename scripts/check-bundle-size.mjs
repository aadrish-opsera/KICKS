#!/usr/bin/env node
/**
 * Fail the build if total gzipped JS under dist/assets exceeds the budget.
 * Budget: 200 KiB gzipped (WO-150 / NFR).
 */
import { gzipSync } from 'node:zlib'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const BUDGET_BYTES = 200 * 1024
const assetsDir = join(process.cwd(), 'dist', 'assets')

function gzipSize(filePath) {
  return gzipSync(readFileSync(filePath)).length
}

async function main() {
  if (!existsSync(assetsDir)) {
    console.error(
      `Bundle check failed: ${assetsDir} not found. Run \`npm run build\` first.`,
    )
    process.exit(1)
  }

  const jsFiles = readdirSync(assetsDir).filter((name) => name.endsWith('.js'))
  if (jsFiles.length === 0) {
    console.error('Bundle check failed: no JS assets found in dist/assets.')
    process.exit(1)
  }

  let totalGzip = 0
  for (const name of jsFiles) {
    const filePath = join(assetsDir, name)
    const gz = gzipSize(filePath)
    const raw = statSync(filePath).size
    totalGzip += gz
    console.log(`${name}: raw=${raw} gzip=${gz}`)
  }

  console.log(
    `Total JS gzip=${totalGzip} bytes (budget ${BUDGET_BYTES}, ${(totalGzip / 1024).toFixed(1)} KiB)`,
  )

  if (totalGzip > BUDGET_BYTES) {
    console.error(
      `Bundle check failed: gzipped JS ${totalGzip} exceeds budget ${BUDGET_BYTES}.`,
    )
    process.exit(1)
  }

  console.log('Bundle check passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

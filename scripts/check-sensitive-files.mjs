#!/usr/bin/env node
/**
 * Fails if sensitive env/key files are git-tracked or present under dist/.
 */
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SENSITIVE_PATTERNS = [
  /^\.env$/,
  /^\.env\.local$/,
  /^\.env\.production$/,
  /^\.env\.staging$/,
  /\.pem$/i,
  /\.key$/i,
  /\.p12$/i,
]

function isSensitive(path) {
  const base = path.split(/[/\\]/).pop() ?? path
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(base) || pattern.test(path))
}

function listGitFiles() {
  const output = execSync('git ls-files', { encoding: 'utf8' })
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function walkDist(dir, found = []) {
  if (!existsSync(dir)) {
    return found
  }
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walkDist(full, found)
    } else if (isSensitive(full.replace(/\\/g, '/'))) {
      found.push(full)
    }
  }
  return found
}

const tracked = listGitFiles().filter((file) => isSensitive(file))
const inDist = walkDist('dist')

if (tracked.length > 0 || inDist.length > 0) {
  console.error('Sensitive file check failed:')
  for (const file of tracked) {
    console.error(`  tracked: ${file}`)
  }
  for (const file of inDist) {
    console.error(`  build: ${file}`)
  }
  process.exit(1)
}

console.log('Sensitive file check passed.')

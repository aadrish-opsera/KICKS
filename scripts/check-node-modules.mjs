#!/usr/bin/env node
/**
 * NPM Build policy gate: fail if any node_modules paths are tracked by git.
 */
import { execSync } from 'node:child_process'

try {
  const output = execSync('git ls-files node_modules', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()

  if (output.length > 0) {
    console.error('NPM Build policy violation: tracked node_modules files found:')
    console.error(output)
    process.exit(1)
  }

  console.log('NPM Build policy check passed: no tracked node_modules files.')
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Failed to run node_modules gate: ${message}`)
  process.exit(1)
}

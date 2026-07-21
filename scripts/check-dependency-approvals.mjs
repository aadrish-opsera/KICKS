#!/usr/bin/env node
/**
 * Fail if a production dependency exceeds 50KB and is not listed in DEPENDENCIES.md.
 * Documents the WO-151 approval gate for large packages.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const APPROVAL_BYTES = 50 * 1024
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const depsDocPath = join(root, 'DEPENDENCIES.md')
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
  if (!existsSync(depsDocPath)) {
    console.error('check-dependency-approvals: DEPENDENCIES.md is missing.')
    process.exit(1)
  }
  if (!existsSync(nodeModules)) {
    console.error(
      'check-dependency-approvals: node_modules missing. Run npm install first.',
    )
    process.exit(1)
  }

  const doc = readFileSync(depsDocPath, 'utf8')
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const deps = Object.keys(pkg.dependencies ?? {}).sort()
  const unapproved = []

  for (const name of deps) {
    const size = dirSizeBytes(join(nodeModules, packageDirName(name)))
    if (size <= APPROVAL_BYTES) continue
    // Require a markdown table row mentioning the package name.
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const listed = new RegExp(`\\|\\s*\`${escaped}\`\\s*\\|`).test(doc)
    if (!listed) {
      unapproved.push({ name, size })
    }
  }

  if (unapproved.length) {
    console.error(
      'check-dependency-approvals: packages over 50KB require an entry in DEPENDENCIES.md:\n',
    )
    for (const row of unapproved) {
      console.error(
        `  - ${row.name} (${(row.size / 1024).toFixed(1)} KiB)`,
      )
    }
    process.exit(1)
  }

  console.log(
    `Dependency approval check passed (${deps.length} production packages).`,
  )
}

main()

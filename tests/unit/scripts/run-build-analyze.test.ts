import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('run-build-analyze script (WO-151)', () => {
  const source = readFileSync(
    join(process.cwd(), 'scripts', 'run-build-analyze.mjs'),
    'utf8',
  )

  it('sets ANALYZE=1 for the visualizer plugin', () => {
    expect(source).toContain("ANALYZE: '1'")
  })

  it('invokes vite build cross-platform', () => {
    expect(source).toContain('vite')
    expect(source).toContain('build')
    expect(source).toContain('spawnSync')
  })

  it('writes a committed artifacts/bundle-analysis.md summary', () => {
    expect(source).toContain('artifacts')
    expect(source).toContain('bundle-analysis.md')
  })
})

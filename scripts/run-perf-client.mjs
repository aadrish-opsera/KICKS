/**
 * WO-150 client performance checks using Playwright library API
 * (avoids hung `npx playwright test` CLI on some Windows setups).
 *
 * Measures:
 * 1. Form submit → results rendered ≤ 6s (mocked /api/recommend)
 * 2. Brand filter click → DOM update ≤ 100ms
 *
 * Starts Vite preview on port 4174 so it does not clash with Lighthouse (4173).
 */
import { chromium } from 'playwright'
import { preview } from 'vite'
import { readFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE = 'http://127.0.0.1:4174'
const RENDER_BUDGET_MS = 6000
const FILTER_BUDGET_MS = 100

const executablePath = join(
  process.env.PLAYWRIGHT_BROWSERS_PATH ||
    join(homedir(), 'AppData', 'Local', 'ms-playwright'),
  'chromium-1169',
  'chrome-win',
  'chrome.exe',
)

const success = JSON.parse(
  readFileSync(join(root, 'e2e/fixtures/mock-recommend-success.json'), 'utf8'),
)

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

if (!existsSync(join(root, 'dist', 'index.html'))) {
  console.error('Client perf failed: dist/ missing. Run `npm run build` first.')
  process.exit(1)
}

if (!existsSync(executablePath)) {
  console.error(
    `Client perf failed: Chromium not found at ${executablePath}. Run \`npx playwright install chromium\`.`,
  )
  process.exit(1)
}

const server = await preview({
  root,
  preview: {
    host: '127.0.0.1',
    port: 4174,
    strictPort: true,
  },
})

let passed = 0
async function check(name, fn) {
  process.stdout.write(`• ${name} ... `)
  await fn()
  passed += 1
  console.log('ok')
}

try {
  const browser = await chromium.launch({ executablePath, headless: true })

  await check('submit → results ≤ 6s (mocked API)', async () => {
    const page = await browser.newPage()
    await page.route('**/api/recommend', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success),
      })
    })

    await page.goto(`${BASE}/`)
    await page.getByLabel(/what kind of sneakers/i).fill('blue Nike runners for school')
    await page.getByRole('radio', { name: '$50 - $100' }).click()

    const started = await page.evaluate(() => performance.now())
    await page.getByRole('button', { name: /find my sneakers/i }).click()
    await page.waitForURL(/\/results/)
    await page.getByRole('article').first().waitFor({ state: 'visible' })
    const elapsed = await page.evaluate((t0) => performance.now() - t0, started)

    console.log(`\n  render_ms=${Math.round(elapsed)} budget=${RENDER_BUDGET_MS}`)
    assert(elapsed <= RENDER_BUDGET_MS, `render ${elapsed}ms exceeds ${RENDER_BUDGET_MS}ms`)
    assert((await page.getByRole('article').count()) === 5, 'expected 5 result cards')
    await page.close()
  })

  await check('filter interaction ≤ 100ms', async () => {
    const page = await browser.newPage()
    await page.route('**/api/recommend', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success),
      })
    })

    await page.goto(`${BASE}/`)
    await page.getByLabel(/what kind of sneakers/i).fill('blue Nike runners for school')
    await page.getByRole('button', { name: /find my sneakers/i }).click()
    await page.waitForURL(/\/results/)
    await page.getByRole('article').first().waitFor({ state: 'visible' })
    assert((await page.getByRole('article').count()) === 5, 'need 5 cards before filter')

    const filterRegion = page.getByRole('region', { name: /filter sneakers/i })
    const adidas = filterRegion.getByRole('button', { name: 'Adidas' })
    await adidas.waitFor({ state: 'visible' })

    // Measure filter → DOM update inside the page so Playwright IPC is excluded.
    const elapsed = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const buttons = Array.from(document.querySelectorAll('button'))
        const btn = buttons.find((el) => el.textContent?.trim() === 'Adidas')
        if (!btn) {
          reject(new Error('Adidas filter button not found'))
          return
        }

        const started = performance.now()
        const timeout = setTimeout(() => {
          observer.disconnect()
          reject(new Error('filter DOM update timed out'))
        }, 2000)

        const observer = new MutationObserver(() => {
          if (document.querySelectorAll('article').length === 1) {
            clearTimeout(timeout)
            observer.disconnect()
            resolve(performance.now() - started)
          }
        })
        observer.observe(document.body, { childList: true, subtree: true })
        btn.click()
      })
    })

    console.log(`\n  filter_ms=${Math.round(elapsed)} budget=${FILTER_BUDGET_MS}`)
    assert(elapsed <= FILTER_BUDGET_MS, `filter ${elapsed}ms exceeds ${FILTER_BUDGET_MS}ms`)
    await page.close()
  })

  await browser.close()
  console.log(`\nPASS ${passed} client perf checks`)
} catch (error) {
  console.error('\nClient perf FAILED:', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await server.close()
  process.exit(process.exitCode ?? 0)
}

/**
 * Local E2E checks using Playwright library (bypasses hung `playwright test` CLI).
 * Requires Vite: npm run dev -- --host 127.0.0.1 --port 5173
 */
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
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
const errors = JSON.parse(
  readFileSync(join(root, 'e2e/fixtures/mock-recommend-error.json'), 'utf8'),
)

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

let passed = 0
async function check(name, fn) {
  process.stdout.write(`• ${name} ... `)
  await fn()
  passed += 1
  console.log('ok')
}

const browser = await chromium.launch({ executablePath, headless: true })

async function withPage(mode, fn) {
  const page = await browser.newPage()
  let calls = 0
  await page.route('**/api/recommend', async (route) => {
    calls += 1
    if (mode === 'sneaker-error') {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify(errors.sneakerApiUnavailable),
      })
      return
    }
    if (mode === 'gemini-error') {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify(errors.geminiApiUnavailable),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(success),
    })
  })
  try {
    await fn(page, () => calls)
  } finally {
    await page.close()
  }
}

await check('US-001/002 home input + budget', async () => {
  await withPage('success', async (page) => {
    await page.goto('http://127.0.0.1:5173/')
    const prefs = page.getByLabel(/what kind of sneakers/i)
    await prefs.fill('ab')
    assert(await page.getByRole('alert').count(), 'expected short validation')
    await prefs.fill('blue Nike runners')
    await page.getByRole('radio', { name: '$100 - $150' }).click()
    assert(
      (await page.getByRole('radio', { name: '$100 - $150' }).getAttribute('aria-checked')) ===
        'true',
      'budget not selected',
    )
  })
})

await check('US-003 results show 5 cards', async () => {
  await withPage('success', async (page) => {
    await page.goto('http://127.0.0.1:5173/')
    await page.getByLabel(/what kind of sneakers/i).fill('blue Nike runners for school')
    await page.getByRole('radio', { name: '$50 - $100' }).click()
    await page.getByRole('button', { name: /find my sneakers/i }).click()
    await page.waitForURL(/\/results/)
    assert((await page.getByRole('article').count()) === 5, 'need 5 cards')
  })
})

await check('US-005 detail dialog + resale target=_blank', async () => {
  await withPage('success', async (page) => {
    await page.goto('http://127.0.0.1:5173/')
    await page.getByLabel(/what kind of sneakers/i).fill('blue Nike runners for school')
    await page.getByRole('button', { name: /find my sneakers/i }).click()
    await page.waitForURL(/\/results/)
    await page.getByRole('button', { name: /see more/i }).first().click()
    const dialog = page.getByRole('dialog')
    await dialog.waitFor()
    const link = dialog.getByRole('link', { name: /buy on stockx/i })
    assert((await link.getAttribute('target')) === '_blank', 'resale must open new tab')
  })
})

await check('US-007 brand filter', async () => {
  await withPage('success', async (page) => {
    await page.goto('http://127.0.0.1:5173/')
    await page.getByLabel(/what kind of sneakers/i).fill('blue Nike runners for school')
    await page.getByRole('button', { name: /find my sneakers/i }).click()
    await page.waitForURL(/\/results/)
    await page.getByRole('region', { name: /filter sneakers/i }).getByRole('button', { name: 'Adidas' }).click()
    assert((await page.getByRole('article').count()) === 1, 'Adidas filter should leave 1')
  })
})

await check('US-008 sneaker API error UI', async () => {
  await withPage('sneaker-error', async (page) => {
    await page.goto('http://127.0.0.1:5173/')
    await page.getByLabel(/what kind of sneakers/i).fill('blue Nike runners for school')
    await page.getByRole('button', { name: /find my sneakers/i }).click()
    const alert = page.getByRole('alert')
    await alert.waitFor()
    const text = await alert.innerText()
    assert(/sneakers are hard to find/i.test(text), 'wrong sneaker error')
    assert(await page.getByRole('button', { name: /try again/i }).count(), 'missing Try Again')
  })
})

await check('US-009 gemini error UI distinct', async () => {
  await withPage('gemini-error', async (page) => {
    await page.goto('http://127.0.0.1:5173/')
    await page.getByLabel(/what kind of sneakers/i).fill('blue Nike runners for school')
    await page.getByRole('button', { name: /find my sneakers/i }).click()
    const alert = page.getByRole('alert')
    await alert.waitFor()
    const text = await alert.innerText()
    assert(/recommendations are resting/i.test(text), 'wrong gemini error')
    assert(!/sneakers are hard to find/i.test(text), 'messages must differ')
  })
})

await check('comparison limit message', async () => {
  await withPage('success', async (page) => {
    await page.goto('http://127.0.0.1:5173/')
    await page.getByLabel(/what kind of sneakers/i).fill('blue Nike runners for school')
    await page.getByRole('button', { name: /find my sneakers/i }).click()
    await page.waitForURL(/\/results/)
    const boxes = page.getByRole('checkbox', { name: /select .+ for comparison/i })
    await boxes.nth(0).check()
    await boxes.nth(1).check()
    await boxes.nth(2).check()
    await boxes.nth(3).click({ force: true })
    assert(
      await page.getByText(/please deselect one sneaker/i).count(),
      'missing limit message',
    )
  })
})

await browser.close()
console.log(`\nPASS ${passed} checks`)

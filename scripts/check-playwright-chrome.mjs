// Quick check: can Node launch your manual Chromium?
import { chromium } from 'playwright'
import { homedir } from 'node:os'
import { join } from 'node:path'

const executablePath = join(
  process.env.PLAYWRIGHT_BROWSERS_PATH ??
    join(homedir(), 'AppData', 'Local', 'ms-playwright'),
  'chromium-1169',
  'chrome-win',
  'chrome.exe',
)

console.log('executablePath:', executablePath)
console.log('launching...')

const browser = await chromium.launch({
  executablePath,
  headless: false,
})
console.log('launch ok')

const page = await browser.newPage()
console.log('opening http://127.0.0.1:5173/ ...')
await page.goto('http://127.0.0.1:5173/', { timeout: 15_000 })
console.log('title:', await page.title())
await page.waitForTimeout(2000)
await browser.close()
console.log('done')

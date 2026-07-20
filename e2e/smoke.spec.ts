import { expect, test } from '@playwright/test'

test('smoke: home page loads', async ({ page }) => {
  console.log('[smoke] starting goto')
  await page.goto('/')
  console.log('[smoke] loaded')
  await expect(page.getByText('KICKS')).toBeVisible()
})

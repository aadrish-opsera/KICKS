import { expect, test } from '@playwright/test'
import { fillHomeAndSubmit, mockRecommendApi } from './helpers/api-mocks'

const FORBIDDEN_JARGON = [
  'submit query',
  'stack trace',
  'HTTP status',
  'null pointer',
  'exception',
]

test.describe('Accessibility & vocabulary (US-010)', () => {
  test('US-010: primary actions have icons/labels and copy stays simple', async ({
    page,
  }) => {
    await mockRecommendApi(page, 'success')
    await page.goto('/')

    const submit = page.getByRole('button', { name: /find my sneakers/i })
    await expect(submit.locator('svg')).toBeVisible()

    const bodyText = (await page.locator('body').innerText()).toLowerCase()
    for (const term of FORBIDDEN_JARGON) {
      expect(bodyText).not.toContain(term)
    }

    await page.getByLabel(/what kind of sneakers/i).fill('blue Nike runners')
    await page.getByRole('button', { name: /find my sneakers/i }).click()
    await expect(page.getByRole('article')).toHaveCount(5)

    await page.keyboard.press('Tab')
    const resultsText = (await page.locator('body').innerText()).toLowerCase()
    for (const term of FORBIDDEN_JARGON) {
      expect(resultsText).not.toContain(term)
    }
    await expect(page.getByRole('button', { name: /see more/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /compare selected/i })).toBeVisible()
  })
})

import { expect, test } from '@playwright/test'
import { fillHomeAndSubmit, mockRecommendApi } from './helpers/api-mocks'

test.describe('Error recovery (US-008, US-009, retry)', () => {
  test('US-008: sneaker API error shows friendly message and Try Again', async ({
    page,
  }) => {
    await mockRecommendApi(page, 'sneaker-error')
    await fillHomeAndSubmit(page)

    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText(/sneakers are hard to find right now/i)
    await expect(alert).toContainText(/trouble finding sneakers/i)
    await expect(alert).not.toContainText(/stack|HTTP|503|Error:/i)
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible()
  })

  test('US-009: Gemini/AI error shows a distinct friendly message', async ({ page }) => {
    await mockRecommendApi(page, 'gemini-error')
    await fillHomeAndSubmit(page)

    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText(/recommendations are resting/i)
    await expect(alert).toContainText(/recommendation engine is taking a break/i)
    await expect(alert).not.toContainText(/sneakers are hard to find right now/i)
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible()
  })

  test('retry flow: Try Again re-submits with preferences retained', async ({ page }) => {
    await mockRecommendApi(page, 'success-after-error')
    const prefs = 'blue Nike runners for school'
    await fillHomeAndSubmit(page, prefs)

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByLabel(/what kind of sneakers/i)).toHaveValue(prefs)

    await page.getByRole('button', { name: /try again/i }).click()
    await expect(page).toHaveURL(/\/results/)
    await expect(page.getByRole('article')).toHaveCount(5)
  })
})

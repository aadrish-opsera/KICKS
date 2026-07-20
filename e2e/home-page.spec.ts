import { expect, test } from '@playwright/test'
import { fillHomeAndSubmit, mockRecommendApi } from './helpers/api-mocks'

test.describe('Home page (US-001, US-002)', () => {
  test('US-001: accepts natural language preferences of at least 3 characters', async ({
    page,
  }) => {
    await mockRecommendApi(page, 'success')
    await page.goto('/')

    const preferences = page.getByLabel(/what kind of sneakers/i)
    await preferences.fill('ab')
    await expect(page.getByRole('alert')).toContainText(/at least 3 characters/i)
    await expect(page.getByRole('button', { name: /find my sneakers/i })).toBeDisabled()

    await preferences.fill('abc')
    await expect(page.getByRole('alert')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /find my sneakers/i })).toBeEnabled()
    await expect(preferences).toHaveValue('abc')
  })

  test('US-002: budget selector has a default and confirms a chosen range', async ({
    page,
  }) => {
    await page.goto('/')

    const group = page.getByRole('radiogroup')
    await expect(group).toBeVisible()

    const budgetFifty = page.getByRole('radio', { name: '$50 - $100' })
    await budgetFifty.click()
    await expect(budgetFifty).toHaveAttribute('aria-checked', 'true')

    const budgetHundred = page.getByRole('radio', { name: '$100 - $150' })
    await budgetHundred.click()
    await expect(budgetHundred).toHaveAttribute('aria-checked', 'true')
    await expect(budgetFifty).toHaveAttribute('aria-checked', 'false')
  })

  test('submits home form and reaches results with mocked API', async ({ page }) => {
    await mockRecommendApi(page, 'success')
    await fillHomeAndSubmit(page)
    await expect(page).toHaveURL(/\/results/)
    await expect(page.getByRole('heading', { name: /your top matches/i })).toBeVisible()
  })
})

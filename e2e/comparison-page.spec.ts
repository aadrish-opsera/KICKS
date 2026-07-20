import { expect, test } from '@playwright/test'
import { fillHomeAndSubmit, mockRecommendApi } from './helpers/api-mocks'

test.describe('Comparison page (US-004)', () => {
  test('US-004: select 2–3 sneakers and open comparison view', async ({ page }) => {
    await mockRecommendApi(page, 'success')
    await fillHomeAndSubmit(page)

    const checkboxes = page.getByRole('checkbox', { name: /select .+ for comparison/i })
    await checkboxes.nth(0).check()
    await checkboxes.nth(1).check()
    await page.getByRole('button', { name: /compare selected/i }).click()

    await expect(page).toHaveURL(/\/comparison/)
    await expect(page.getByRole('heading', { name: /compare your picks/i })).toBeVisible()
    await expect(page.getByRole('table', { name: /sneaker comparison table/i })).toBeVisible()
    await expect(page.getByText('Air Max 90')).toBeVisible()
    await expect(page.getByText('Dunk Low')).toBeVisible()
  })

  test('US-004 mobile: comparison is scrollable at narrow viewport', async ({ page }) => {
    test.skip(test.info().project.name !== 'custom-320px', '320px project only')

    await mockRecommendApi(page, 'success')
    await fillHomeAndSubmit(page)
    const checkboxes = page.getByRole('checkbox', { name: /select .+ for comparison/i })
    await checkboxes.nth(0).check()
    await checkboxes.nth(1).check()
    await checkboxes.nth(2).check()
    await page.getByRole('button', { name: /compare selected/i }).click()

    const region = page.getByRole('region', { name: /sneaker comparison/i })
    await expect(region).toBeVisible()
    const box = await region.boundingBox()
    expect(box).not.toBeNull()
  })
})

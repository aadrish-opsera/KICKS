import { expect, test } from '@playwright/test'
import { fillHomeAndSubmit, mockRecommendApi } from './helpers/api-mocks'

test.describe('Business rules', () => {
  test('sequential flow: comparison is empty without prior selection from results', async ({
    page,
  }) => {
    await page.goto('/comparison')
    await expect(
      page.getByText(/no sneakers selected for comparison/i),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: /back to results/i })).toBeVisible()
  })

  test('comparison limit: selecting a 4th sneaker is prevented', async ({ page }) => {
    await mockRecommendApi(page, 'success')
    await fillHomeAndSubmit(page)

    const checkboxes = page.getByRole('checkbox', { name: /select .+ for comparison/i })
    await checkboxes.nth(0).check()
    await checkboxes.nth(1).check()
    await checkboxes.nth(2).check()
    await checkboxes.nth(3).check()

    await expect(
      page.getByText(/please deselect one sneaker before adding another/i),
    ).toBeVisible()
    await expect(checkboxes.nth(3)).not.toBeChecked()
  })

  test('external links open in a new tab', async ({ page }) => {
    await mockRecommendApi(page, 'success')
    await fillHomeAndSubmit(page)

    const link = page.getByRole('link', { name: /buy on stockx/i }).first()
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noopener/)
  })

  test('direct /results without state redirects home', async ({ page }) => {
    await page.goto('/results')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: /find sneakers you will love/i })).toBeVisible()
  })
})

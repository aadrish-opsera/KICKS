import { expect, test } from '@playwright/test'
import { fillHomeAndSubmit, mockRecommendApi } from './helpers/api-mocks'

test.describe('Degraded AI mode', () => {
  test('shows quota banner and results without AI explanations', async ({ page }) => {
    await mockRecommendApi(page, 'degraded')
    await fillHomeAndSubmit(page)

    await expect(page.getByRole('article')).toHaveCount(5)
    await expect(
      page.getByText(/AI-powered explanations are temporarily unavailable/i),
    ).toBeVisible()
    await expect(page.getByText(/no explanation available/i).first()).toBeVisible()
  })
})

import { expect, test } from '@playwright/test'
import { fillHomeAndSubmit, mockRecommendApi } from './helpers/api-mocks'

test.describe('Sneaker detail (US-005)', () => {
  test('US-005: See More opens detail dialog with fields and resale link', async ({
    page,
  }) => {
    await mockRecommendApi(page, 'success')
    await fillHomeAndSubmit(page)

    await page.getByRole('button', { name: /see more/i }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Air Max 90')).toBeVisible()
    await expect(dialog.getByText('Nike')).toBeVisible()
    await expect(dialog.getByText(/White\/Black/)).toBeVisible()
    await expect(dialog.getByText(/\$130/)).toBeVisible()
    await expect(dialog.locator('img')).toBeVisible()

    const resale = dialog.getByRole('link', { name: /buy on stockx/i })
    await expect(resale).toHaveAttribute('target', '_blank')
    await expect(resale).toHaveAttribute('rel', /noopener/)
    await expect(resale).toHaveAttribute('href', /stockx\.com/)
  })
})

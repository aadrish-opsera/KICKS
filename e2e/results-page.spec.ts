import { expect, test } from '@playwright/test'
import { fillHomeAndSubmit, mockRecommendApi } from './helpers/api-mocks'

test.describe('Results page (US-003, US-007)', () => {
  test('US-003: shows exactly 5 ranked sneakers with required fields within 6s', async ({
    page,
  }) => {
    await mockRecommendApi(page, 'success')
    const started = Date.now()
    await fillHomeAndSubmit(page)

    const cards = page.getByRole('article')
    await expect(cards).toHaveCount(5, { timeout: 6_000 })
    expect(Date.now() - started).toBeLessThan(6_000)

    for (let i = 0; i < 5; i += 1) {
      const card = cards.nth(i)
      await expect(card.getByLabel(new RegExp(`Rank ${i + 1}`, 'i'))).toBeVisible()
      await expect(card.locator('img')).toBeVisible()
      await expect(card.getByText(/Nike|Adidas|New Balance|Converse/)).toBeVisible()
      await expect(card.getByText(/\$\d+/)).toBeVisible()
    }

    await expect(page.getByText(/great everyday shoe/i).first()).toBeVisible()
  })

  test('US-007: client-side brand filter updates instantly and shows empty message', async ({
    page,
  }) => {
    await mockRecommendApi(page, 'success')
    await fillHomeAndSubmit(page)
    await expect(page.getByRole('article')).toHaveCount(5)

    const filterRegion = page.getByRole('region', { name: /filter sneakers/i })
    await filterRegion.getByRole('button', { name: 'Adidas' }).click()
    await expect(page.getByRole('article')).toHaveCount(1)
    await expect(page.getByText('Gazelle')).toBeVisible()

    // Combine brand + price so Gazelle ($90) is excluded → empty state
    await filterRegion.getByRole('button', { name: /\$\d+\+/ }).click()
    await expect(
      page.getByText(/no sneakers match your filters/i),
    ).toBeVisible()
    await page.getByRole('button', { name: /clear filters/i }).click()
    await expect(page.getByRole('article')).toHaveCount(5)
  })
})

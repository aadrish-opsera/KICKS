import { expect, test } from '@playwright/test'
import { fillHomeAndSubmit, mockRecommendApi } from './helpers/api-mocks'

test.describe('Mobile responsive (US-006)', () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'custom-320px',
      'US-006 runs on the custom 320px project only',
    )
  })

  test('US-006: 320px layout has no horizontal scroll and large touch targets', async ({
    page,
  }) => {
    await mockRecommendApi(page, 'success')
    await page.goto('/')

    const overflowX = await page.evaluate(() => {
      const doc = document.documentElement
      return Math.max(doc.scrollWidth, document.body.scrollWidth) - window.innerWidth
    })
    expect(overflowX).toBeLessThanOrEqual(1)

    const submit = page.getByRole('button', { name: /find my sneakers/i })
    // Submit may be disabled until preferences are valid — fill first for size check
    await page.getByLabel(/what kind of sneakers/i).fill('blue Nike runners')
    const box = await submit.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.height).toBeGreaterThanOrEqual(44)

    await fillHomeAndSubmit(page)
    await expect(page.getByRole('article')).toHaveCount(5)

    const resultsOverflow = await page.evaluate(() => {
      const doc = document.documentElement
      return Math.max(doc.scrollWidth, document.body.scrollWidth) - window.innerWidth
    })
    expect(resultsOverflow).toBeLessThanOrEqual(1)

    const seeMore = page.getByRole('button', { name: /see more/i }).first()
    const seeMoreBox = await seeMore.boundingBox()
    expect(seeMoreBox).not.toBeNull()
    expect(Math.min(seeMoreBox!.width, seeMoreBox!.height)).toBeGreaterThanOrEqual(40)
  })
})

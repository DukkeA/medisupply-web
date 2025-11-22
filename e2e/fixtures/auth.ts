import { test as base, Page } from '@playwright/test'

/**
 * Fixture for authenticated pages
 * Use this when you need to test pages that require authentication
 */
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/auth/login')

    // Fill in login credentials
    // NOTE: Update these with your actual test credentials or environment variables
    const email = process.env.TEST_EMAIL || 'test@example.com'
    const password = process.env.TEST_PASSWORD || 'password123'

    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)

    // Submit login form
    await page.click('button[type="submit"]')

    // Wait for authentication to complete
    await page.waitForNavigation()

    // Use the authenticated page in tests
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page)
  }
})

export { expect } from '@playwright/test'

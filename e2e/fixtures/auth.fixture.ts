import { test as base, Page } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

type AuthFixtures = {
  authenticatedPage: Page
}

/**
 * Custom fixture that provides an authenticated page
 * Automatically logs in before each test
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Get credentials from environment
    const email = process.env.E2E_TEST_USER_EMAIL || 'test@example.com'
    const password = process.env.E2E_TEST_USER_PASSWORD || 'password123'

    // Perform login
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(email, password)
    await loginPage.expectLoginSuccess()

    // Provide the authenticated page to the test
    await use(page)

    // Cleanup (logout) could be done here if needed
  }
})

export { expect } from '@playwright/test'

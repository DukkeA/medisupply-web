import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/login.page'

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.loginButton).toBeVisible()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('invalid@example.com', 'wrongpassword')

    // Wait for error state
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 })
  })

  test('should redirect to dashboard on successful login', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    // Use test credentials - replace with actual test account
    await loginPage.login(
      process.env.E2E_TEST_EMAIL || 'test@example.com',
      process.env.E2E_TEST_PASSWORD || 'testpassword'
    )

    // Should redirect to dashboard or home page
    await expect(page).toHaveURL(/\/(dashboard)?$/, { timeout: 10000 })
  })
})

import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'

test.describe('Authentication', () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
  })

  test('should display login form', async ({ page }) => {
    await expect(page).toHaveURL('/login')
    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.loginButton).toBeVisible()
  })

  test('should successfully login with valid credentials', async () => {
    const email = process.env.E2E_TEST_USER_EMAIL || 'test@example.com'
    const password = process.env.E2E_TEST_USER_PASSWORD || 'password123'

    await loginPage.login(email, password)
    await loginPage.expectLoginSuccess()

    // Should see homepage
    await expect(
      loginPage.page.getByRole('heading', { name: /welcome/i })
    ).toBeVisible()
  })

  test('should persist session after page reload', async ({ page }) => {
    const email = process.env.E2E_TEST_USER_EMAIL || 'test@example.com'
    const password = process.env.E2E_TEST_USER_PASSWORD || 'password123'

    await loginPage.login(email, password)
    await loginPage.expectLoginSuccess()

    // Reload the page
    await page.reload()

    // Should still be on homepage (not redirected to login)
    await expect(page).toHaveURL('/')
  })
})

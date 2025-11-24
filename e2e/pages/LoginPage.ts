import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object for Login page
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly errorAlert: Locator

  constructor(page: Page) {
    super(page)
    this.emailInput = page.getByLabel(/email/i)
    this.passwordInput = page.getByLabel(/password/i)
    this.loginButton = page.getByRole('button', {
      name: /login|iniciar sesión/i
    })
    this.errorAlert = page.getByRole('alert')
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await super.goto('/login')
  }

  /**
   * Perform login with credentials
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  /**
   * Expect successful login (redirects to homepage)
   */
  async expectLoginSuccess() {
    // Wait for URL to change to / without waiting for load event
    await this.page.waitForURL('/', {
      timeout: 30000,
      waitUntil: 'domcontentloaded'
    })
  }

  /**
   * Expect login failure with error message
   */
  async expectLoginError(message?: string) {
    await this.errorAlert.waitFor({ state: 'visible' })
    if (message) {
      await expect(this.errorAlert).toContainText(message)
    }
  }

  /**
   * Check if user is on login page
   */
  async isOnLoginPage(): Promise<boolean> {
    return this.page.url().includes('/login')
  }
}

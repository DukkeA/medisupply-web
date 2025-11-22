import { Page, Locator } from '@playwright/test'

/**
 * Base Page Object with common methods shared across all pages
 */
export class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string) {
    await this.page.goto(path)
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Get element by data-testid attribute
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId)
  }

  /**
   * Wait for toast message to appear
   */
  async waitForToast(message: string | RegExp) {
    const toast = this.page.locator('[data-sonner-toast]', { hasText: message })
    await toast.waitFor({ state: 'visible' })
    return toast
  }

  /**
   * Wait for success toast
   */
  async expectSuccessToast(message: string | RegExp) {
    await this.waitForToast(message)
  }

  /**
   * Wait for error toast
   */
  async expectErrorToast(message: string | RegExp) {
    await this.waitForToast(message)
  }
}

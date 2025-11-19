import { Page, expect } from '@playwright/test';

/**
 * Common test helpers for E2E tests
 */

/**
 * Wait for an element to be visible on the page
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { timeout });
  return page.locator(selector);
}

/**
 * Check if element is visible
 */
export async function isElementVisible(page: Page, selector: string) {
  try {
    await page.waitForSelector(selector, { timeout: 2000 });
    return await page.isVisible(selector);
  } catch {
    return false;
  }
}

/**
 * Fill form field and verify
 */
export async function fillFormField(
  page: Page,
  fieldSelector: string,
  value: string,
) {
  const field = page.locator(fieldSelector);
  await field.fill(value);
  await expect(field).toHaveValue(value);
}

/**
 * Submit form and wait for navigation or network idle
 */
export async function submitForm(page: Page, formSelector: string) {
  const form = page.locator(formSelector);
  await form.evaluate((el: any) => el.submit?.());
  await page.waitForLoadState('networkidle');
}

/**
 * Click element and wait for navigation
 */
export async function clickAndWaitForNavigation(
  page: Page,
  selector: string,
  timeout = 30000,
) {
  await Promise.all([
    page.waitForNavigation({ timeout }),
    page.click(selector),
  ]);
}

/**
 * Get table data from a simple HTML table
 */
export async function getTableData(page: Page, tableSelector: string) {
  return page.evaluate((selector) => {
    const table = document.querySelector(selector);
    if (!table) return [];

    const rows = Array.from(table.querySelectorAll('tbody tr'));
    return rows.map((row) => {
      const cells = Array.from(row.querySelectorAll('td'));
      return cells.map((cell) => cell.textContent?.trim());
    });
  }, tableSelector);
}

/**
 * Check for toast/notification message
 */
export async function waitForNotification(
  page: Page,
  message: string,
  timeout = 5000,
) {
  const notification = page.locator(`text=${message}`);
  await notification.waitFor({ timeout });
  return notification;
}

/**
 * Take screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  await page.screenshot({ path: `screenshots/${name}-${timestamp}.png` });
}

/**
 * Handle modal dialog and click button
 */
export async function handleModalButton(
  page: Page,
  buttonText: string,
  timeout = 5000,
) {
  const button = page.locator(`button:has-text("${buttonText}")`).first();
  await button.waitFor({ timeout });
  await button.click();
}

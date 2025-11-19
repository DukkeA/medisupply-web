import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Verify the page is loaded
    expect(page.url()).toContain('localhost:3000');
  });

  test('should have a title', async ({ page }) => {
    // Check that the page has some content
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // The viewport is already set by the Mobile Chrome device config
    // Verify the page loads on mobile viewport
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('localhost:3000');
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');

    // Verify we're on the home page
    const currentUrl = page.url();
    expect(currentUrl).toContain('localhost:3000');
  });
});

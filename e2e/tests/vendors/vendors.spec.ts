import { test, expect } from '../../fixtures/auth.fixture'
import { VendorsPage } from '../../pages/VendorsPage'

test.describe('Vendors Management', () => {
  let vendorsPage: VendorsPage

  test.beforeEach(async ({ authenticatedPage }) => {
    vendorsPage = new VendorsPage(authenticatedPage)
    await vendorsPage.goto()
  })

  test('should display vendors list', async ({ authenticatedPage }) => {
    // Wait for table to load by waiting for any data row to appear (not the header row)
    await authenticatedPage
      .getByRole('table')
      .getByRole('row')
      .nth(1) // Second row (first data row, skipping header)
      .waitFor({ state: 'visible', timeout: 15000 })

    // Verify table headers are present by finding the text in the table
    await expect(
      vendorsPage.vendorsTable.getByText(/name/i).first()
    ).toBeVisible()
    await expect(
      vendorsPage.vendorsTable.getByText(/email/i).first()
    ).toBeVisible()
    await expect(
      vendorsPage.vendorsTable.getByText(/phone/i).first()
    ).toBeVisible()
    await expect(
      vendorsPage.vendorsTable.getByText(/country/i).first()
    ).toBeVisible()
  })

  test('should open add vendor modal', async ({ authenticatedPage }) => {
    await vendorsPage.openAddVendorModal()

    // Verify modal is visible with form fields
    await expect(authenticatedPage.getByRole('dialog')).toBeVisible()
    await expect(vendorsPage.nameInput).toBeVisible()
    await expect(vendorsPage.emailInput).toBeVisible()
    await expect(vendorsPage.phoneInput).toBeVisible()
  })

  test('should create new vendor', async ({ authenticatedPage }) => {
    const vendorData = {
      name: `Test Vendor ${Date.now()}`,
      email: `vendor${Date.now()}@test.com`,
      phone: '+1234567890',
      country: 'United States',
      city: 'New York'
    }

    await vendorsPage.createVendor(vendorData)

    // Verify success toast appears
    await vendorsPage.expectVendorCreated()

    // Verify the new vendor appears in the table
    await expect(
      authenticatedPage.getByRole('row').filter({ hasText: vendorData.name })
    ).toBeVisible({ timeout: 10000 })
  })

  test('should display add vendor button', async () => {
    await expect(vendorsPage.addVendorButton).toBeVisible()
    await expect(vendorsPage.addVendorButton).toBeEnabled()
  })
})

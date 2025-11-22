import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export type VendorData = {
  name: string
  email: string
  phone: string
  country: string
  city: string
}

/**
 * Page Object for Vendors page
 */
export class VendorsPage extends BasePage {
  readonly addVendorButton: Locator
  readonly vendorsTable: Locator
  readonly nameInput: Locator
  readonly emailInput: Locator
  readonly phoneInput: Locator
  readonly countryInput: Locator
  readonly cityInput: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    super(page)
    this.addVendorButton = page.getByTestId('add-vendor-button')
    this.vendorsTable = page.getByTestId('vendors-table')
    this.nameInput = page.getByPlaceholder('John Doe')
    this.emailInput = page.getByPlaceholder('john@example.com')
    this.phoneInput = page.getByPlaceholder('+1 234 567 8900')
    // Country and city are combobox buttons, not inputs
    this.countryInput = page.getByRole('combobox').first()
    this.cityInput = page.getByRole('combobox').last()
    this.submitButton = page.getByRole('button', { name: /create|crear/i })
  }

  /**
   * Navigate to vendors page
   */
  async goto() {
    await super.goto('/vendors')
  }

  /**
   * Open add vendor modal
   */
  async openAddVendorModal() {
    await this.addVendorButton.click()
    await this.page.getByRole('dialog').waitFor({ state: 'visible' })
  }

  /**
   * Create a vendor
   */
  async createVendor(data: VendorData) {
    await this.openAddVendorModal()
    await this.nameInput.fill(data.name)
    await this.emailInput.fill(data.email)
    await this.phoneInput.fill(data.phone)

    // Select country from combobox
    await this.countryInput.click()
    await this.page.getByPlaceholder('Search country...').fill(data.country)
    // Wait for options to appear and click the matching one
    await this.page
      .getByRole('option')
      .filter({ hasText: new RegExp(data.country, 'i') })
      .first()
      .click()

    // Select city/state from combobox
    await this.cityInput.click()
    await this.page.getByPlaceholder('Search state...').fill(data.city)
    // Wait for options to appear and click the matching one
    await this.page
      .getByRole('option')
      .filter({ hasText: new RegExp(data.city, 'i') })
      .first()
      .click()

    await this.submitButton.click()
  }

  /**
   * Expect vendor to be created successfully
   */
  async expectVendorCreated() {
    await this.expectSuccessToast(/vendor.*created|vendedor.*creado/i)
  }

  /**
   * Expect vendor row in table
   */
  async expectVendorRow(vendorName: string) {
    const row = this.vendorsTable.getByRole('row', {
      name: new RegExp(vendorName, 'i')
    })
    await expect(row).toBeVisible()
  }
}

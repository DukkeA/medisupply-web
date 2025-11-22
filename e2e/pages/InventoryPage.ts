import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export type InventoryData = {
  productName: string
  warehouseName: string
  quantity: number
  batchNumber: string
  expirationDate: string // YYYY-MM-DD format
}

/**
 * Page Object for Inventory page
 */
export class InventoryPage extends BasePage {
  readonly addInventoryButton: Locator
  readonly productSelect: Locator
  readonly warehouseSelect: Locator
  readonly quantityInput: Locator
  readonly batchNumberInput: Locator
  readonly expirationDateInput: Locator
  readonly submitButton: Locator
  readonly cancelButton: Locator
  readonly inventoryTable: Locator

  constructor(page: Page) {
    super(page)
    this.addInventoryButton = page.getByTestId('add-inventory-button')
    this.productSelect = page.getByTestId('product-select')
    this.warehouseSelect = page.getByTestId('warehouse-select')
    this.quantityInput = page.getByPlaceholder('100')
    this.batchNumberInput = page.getByPlaceholder('BATCH001')
    // Expiration date is a calendar button, not a simple input
    this.expirationDateInput = page.getByRole('button').filter({
      has: page.locator('.lucide-calendar')
    })
    this.submitButton = page.getByRole('button', {
      name: /add to inventory|crear|agregar/i
    })
    this.cancelButton = page.getByRole('button', { name: /cancel|cancelar/i })
    this.inventoryTable = page.getByRole('table')
  }

  /**
   * Navigate to inventory page
   */
  async goto() {
    await super.goto('/inventory')
  }

  /**
   * Open add inventory modal
   */
  async openAddInventoryModal() {
    await this.addInventoryButton.click()
    // Wait for modal to be visible
    await this.page.getByRole('dialog').waitFor({ state: 'visible' })
  }

  /**
   * Select product from dropdown
   */
  async selectProduct(productName: string) {
    await this.productSelect.click()
    // Wait for options to load before selecting
    const option = this.page
      .getByRole('option', { name: new RegExp(productName, 'i') })
      .first()
    await option.waitFor({ state: 'visible', timeout: 15000 })
    await option.click()
  }

  /**
   * Select warehouse from dropdown
   */
  async selectWarehouse(warehouseName: string) {
    await this.warehouseSelect.click()
    // Wait for options to load before selecting
    const option = this.page
      .getByRole('option', { name: new RegExp(warehouseName, 'i') })
      .first()
    await option.waitFor({ state: 'visible', timeout: 15000 })
    await option.click()
  }

  /**
   * Add inventory item
   */
  async addInventory(data: InventoryData) {
    await this.openAddInventoryModal()
    await this.selectProduct(data.productName)
    await this.selectWarehouse(data.warehouseName)
    await this.quantityInput.fill(data.quantity.toString())
    await this.batchNumberInput.fill(data.batchNumber)

    // Select date from calendar
    await this.expirationDateInput.click()
    // Parse the date string (YYYY-MM-DD) and click on the calendar
    const [year, month, day] = data.expirationDate.split('-')
    const targetDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    )
    const currentDate = new Date()

    // Navigate to the correct month/year
    const nextMonthButton = this.page.getByRole('button', {
      name: /go to the next month/i
    })
    const prevMonthButton = this.page.getByRole('button', {
      name: /go to the previous month/i
    })

    // Calculate months difference
    const monthsDiff =
      (targetDate.getFullYear() - currentDate.getFullYear()) * 12 +
      (targetDate.getMonth() - currentDate.getMonth())

    if (monthsDiff > 0) {
      for (let i = 0; i < monthsDiff; i++) {
        await nextMonthButton.click()
        await this.page.waitForTimeout(100) // Small delay for calendar to update
      }
    } else if (monthsDiff < 0) {
      for (let i = 0; i < Math.abs(monthsDiff); i++) {
        await prevMonthButton.click()
        await this.page.waitForTimeout(100)
      }
    }

    // Calendar buttons have full names like "Saturday, November 22nd, 2025"
    // We need to match the date pattern like "22nd" or "November 22"
    const dateButton = this.page
      .getByRole('button')
      .filter({ hasText: new RegExp(`\\b${parseInt(day)}(st|nd|rd|th)?\\b`) })
      .first()
    // Wait for calendar to be visible
    await dateButton.waitFor({ state: 'visible', timeout: 10000 })
    await dateButton.click()

    await this.submitButton.click()
  }

  /**
   * Expect inventory to be added successfully
   */
  async expectInventoryAdded() {
    await this.expectSuccessToast(/inventory.*added|inventario.*agregado/i)
  }

  /**
   * Expect inventory row to exist in table
   */
  async expectInventoryRow(productName: string) {
    const row = this.inventoryTable.getByRole('row', {
      name: new RegExp(productName, 'i')
    })
    await expect(row).toBeVisible()
  }

  /**
   * Get inventory count from table
   */
  async getInventoryCount(): Promise<number> {
    const rows = this.inventoryTable
      .getByRole('row')
      .filter({ hasNot: this.page.getByRole('columnheader') })
    return await rows.count()
  }
}

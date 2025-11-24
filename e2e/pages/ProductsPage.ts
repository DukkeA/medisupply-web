import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export type ProductData = {
  sku: string
  name: string
  category: string
  providerName: string
  price: number
  stock: number
}

/**
 * Page Object for Products page
 */
export class ProductsPage extends BasePage {
  readonly addProductButton: Locator
  readonly uploadCSVButton: Locator
  readonly skuInput: Locator
  readonly nameInput: Locator
  readonly categorySelect: Locator
  readonly providerSelect: Locator
  readonly priceInput: Locator
  readonly stockInput: Locator
  readonly submitButton: Locator
  readonly productsTable: Locator
  readonly csvFileInput: Locator

  constructor(page: Page) {
    super(page)
    this.addProductButton = page.getByTestId('add-product-button')
    this.uploadCSVButton = page.getByTestId('upload-csv-button')
    this.skuInput = page.getByPlaceholder('SKU-001')
    this.nameInput = page.getByPlaceholder('Paracetamol 500mg')
    this.categorySelect = page.getByTestId('category-select')
    this.providerSelect = page.getByTestId('provider-select')
    this.priceInput = page.getByPlaceholder('19.99')
    // Stock input doesn't exist in the actual form
    this.stockInput = page.getByPlaceholder('Stock')
    this.submitButton = page.getByRole('button', { name: /create|crear/i })
    this.productsTable = page.getByRole('table')
    this.csvFileInput = page.getByTestId('csv-file-input')
  }

  /**
   * Navigate to products page
   */
  async goto() {
    await super.goto('/products')
  }

  /**
   * Open add product modal
   */
  async openAddProductModal() {
    await this.addProductButton.click()
    await this.page.getByRole('dialog').waitFor({ state: 'visible' })
  }

  /**
   * Open upload CSV modal
   */
  async openUploadCSVModal() {
    await this.uploadCSVButton.click()
    await this.page.getByRole('dialog').waitFor({ state: 'visible' })
  }

  /**
   * Create a product
   */
  async createProduct(data: ProductData) {
    await this.openAddProductModal()
    await this.nameInput.fill(data.name)
    await this.skuInput.fill(data.sku)

    // Select category
    await this.categorySelect.click()
    await this.page
      .getByRole('option', { name: new RegExp(data.category, 'i') })
      .click()

    await this.priceInput.fill(data.price.toString())

    // Select provider
    await this.providerSelect.click()
    await this.page
      .getByRole('option', { name: new RegExp(data.providerName, 'i') })
      .click()

    await this.submitButton.click()
  }

  /**
   * Upload products from CSV file
   */
  async uploadCSV(filePath: string) {
    await this.openUploadCSVModal()
    await this.csvFileInput.setInputFiles(filePath)
    await this.submitButton.click()
  }

  /**
   * Expect product to be created successfully
   */
  async expectProductCreated() {
    await this.expectSuccessToast(/product.*created|producto.*creado/i)
  }

  /**
   * Expect CSV upload success
   */
  async expectCSVUploaded() {
    await this.expectSuccessToast(/products.*uploaded|productos.*cargados/i)
  }

  /**
   * Expect product row in table
   */
  async expectProductRow(productName: string) {
    const row = this.productsTable.getByRole('row', {
      name: new RegExp(productName, 'i')
    })
    await expect(row).toBeVisible()
  }

  /**
   * Search for product
   */
  async searchProduct(query: string) {
    const searchInput = this.page.getByPlaceholder(/search|buscar/i)
    await searchInput.fill(query)
  }
}

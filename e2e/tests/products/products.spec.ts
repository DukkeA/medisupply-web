import { test, expect } from '../../fixtures/auth.fixture'
import { ProductsPage } from '../../pages/ProductsPage'

test.describe('Products Management', () => {
  let productsPage: ProductsPage

  test.beforeEach(async ({ authenticatedPage }) => {
    productsPage = new ProductsPage(authenticatedPage)
    await productsPage.goto()
  })

  test('should display products list', async ({ authenticatedPage }) => {
    // Wait for table to load by waiting for any data row to appear (not the header row)
    await authenticatedPage
      .getByRole('table')
      .getByRole('row')
      .nth(1) // Second row (first data row, skipping header)
      .waitFor({ state: 'visible', timeout: 15000 })

    // Verify table headers are present by finding the text in the table
    await expect(
      productsPage.productsTable.getByText('SKU').first()
    ).toBeVisible()
    await expect(
      productsPage.productsTable.getByText(/name/i).first()
    ).toBeVisible()
    await expect(
      productsPage.productsTable.getByText(/category/i).first()
    ).toBeVisible()
    await expect(
      productsPage.productsTable.getByText(/price/i).first()
    ).toBeVisible()
  })

  test('should open add product modal', async ({ authenticatedPage }) => {
    await productsPage.openAddProductModal()

    // Verify modal is visible with form fields
    await expect(authenticatedPage.getByRole('dialog')).toBeVisible()
    await expect(productsPage.skuInput).toBeVisible()
    await expect(productsPage.nameInput).toBeVisible()
    await expect(productsPage.categorySelect).toBeVisible()
    await expect(productsPage.providerSelect).toBeVisible()
  })

  test('should create new product', async ({ authenticatedPage }) => {
    const productData = {
      sku: `P-${Date.now()}`,
      name: `Test Product ${Date.now()}`,
      category: 'otros',
      providerName: 'Test',
      price: 99.99,
      stock: 100
    }

    await productsPage.openAddProductModal()

    // Fill in product details
    await productsPage.skuInput.fill(productData.sku)
    await productsPage.nameInput.fill(productData.name)

    // Select category - use English text "Others" not Spanish "otros"
    await productsPage.categorySelect.click()
    const categoryOption = authenticatedPage
      .getByRole('option')
      .filter({ hasText: /others/i })
      .first()
    await categoryOption.click()

    // Select provider - get the first available provider
    await productsPage.providerSelect.click()
    const firstProvider = authenticatedPage.getByRole('option').first()
    await firstProvider.click()

    // Fill price
    await productsPage.priceInput.fill(productData.price.toString())

    // Submit the form
    await productsPage.submitButton.click()

    // Verify success toast appears
    await productsPage.expectProductCreated()

    // Wait for modal to close
    await authenticatedPage
      .getByRole('dialog')
      .waitFor({ state: 'detached', timeout: 5000 })

    // Verify the new product appears in the table with much longer timeout
    // The table may take time to refresh after creation
    await expect(
      authenticatedPage.getByRole('row').filter({ hasText: productData.sku })
    ).toBeVisible({ timeout: 30000 })
  })
})

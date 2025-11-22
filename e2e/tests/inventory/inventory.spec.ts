import { test, expect } from '../../fixtures/auth.fixture'
import { InventoryPage } from '../../pages/InventoryPage'

test.describe('Inventory Management', () => {
  let inventoryPage: InventoryPage

  test.beforeEach(async ({ authenticatedPage }) => {
    inventoryPage = new InventoryPage(authenticatedPage)
    await inventoryPage.goto()
  })

  test('should display inventory list', async ({ authenticatedPage }) => {
    // Wait for table to load by waiting for any data row to appear (not the header row)
    await authenticatedPage
      .getByRole('table')
      .getByRole('row')
      .nth(1) // Second row (first data row, skipping header)
      .waitFor({ state: 'visible', timeout: 15000 })

    // Verify table headers are present by finding the text in the table
    await expect(
      inventoryPage.inventoryTable.getByText(/product sku/i).first()
    ).toBeVisible()
    await expect(
      inventoryPage.inventoryTable.getByText(/product name/i).first()
    ).toBeVisible()
    await expect(
      inventoryPage.inventoryTable.getByText(/warehouse name/i).first()
    ).toBeVisible()
    await expect(
      inventoryPage.inventoryTable.getByText(/total quantity/i).first()
    ).toBeVisible()
  })

  test('should open add inventory modal', async () => {
    await inventoryPage.openAddInventoryModal()

    // Verify modal is visible
    await expect(inventoryPage.productSelect).toBeVisible()
    await expect(inventoryPage.warehouseSelect).toBeVisible()
  })

  test('should create new inventory entry', async ({ authenticatedPage }) => {
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    const inventoryData = {
      productName: 'Insulin Glargine',
      warehouseName: 'Bogotá Central Warehouse',
      quantity: 100,
      batchNumber: `BATCH-${Date.now()}`,
      expirationDate: futureDate.toISOString().split('T')[0] // YYYY-MM-DD format
    }

    await inventoryPage.addInventory(inventoryData)

    // Verify success toast appears with longer timeout
    // await inventoryPage.expectInventoryAdded()

    // Verify the new inventory entry appears in the table with much longer timeout
    // The table may take time to refresh after creation
    await expect(
      authenticatedPage
        .getByRole('row')
        .filter({ hasText: inventoryData.batchNumber })
    ).toBeVisible({ timeout: 30000 })
  })
})

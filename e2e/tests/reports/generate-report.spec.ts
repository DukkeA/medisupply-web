import { test, expect } from '../../fixtures/auth.fixture'
import { ReportsPage } from '../../pages/ReportsPage'

test.describe('Reports Generation', () => {
  let reportsPage: ReportsPage

  test.beforeEach(async ({ authenticatedPage }) => {
    reportsPage = new ReportsPage(authenticatedPage)
    await reportsPage.goto()
  })

  test('should display reports page with form', async () => {
    await expect(reportsPage.reportTypeSelect).toBeVisible()
    await expect(reportsPage.dateRangePicker).toBeVisible()
    await expect(reportsPage.generateButton).toBeVisible()
  })

  test('should generate orders per seller report', async () => {
    await reportsPage.generateReport({
      type: 'orders_per_seller',
      startDate: '2025-01-01',
      endDate: '2025-01-31'
    })

    // Report should appear in table (real-time via Ably)
    // Table shows "Orders per Seller" not "orders_per_seller"
    await reportsPage.waitForReportInTable('Orders per Seller')
  })

  test('should generate low stock report', async () => {
    await reportsPage.generateReport({
      type: 'low_stock',
      startDate: '2025-01-01',
      endDate: '2025-01-31'
    })

    // Table shows "Low Stock Alert" not "low_stock"
    await reportsPage.waitForReportInTable('Low Stock Alert')
  })

  test('should generate orders per status report', async () => {
    await reportsPage.generateReport({
      type: 'orders_per_status',
      startDate: '2025-01-01',
      endDate: '2025-01-31'
    })

    // Table shows "Orders by Status" not "orders_per_status"
    await reportsPage.waitForReportInTable('Orders by Status')
  })
})

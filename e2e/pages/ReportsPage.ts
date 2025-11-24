import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export type ReportData = {
  type: 'orders_per_seller' | 'low_stock' | 'orders_per_status'
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
}

/**
 * Page Object for Reports page
 */
export class ReportsPage extends BasePage {
  readonly reportTypeSelect: Locator
  readonly dateRangePicker: Locator
  readonly generateButton: Locator
  readonly reportsTable: Locator
  readonly downloadButton: Locator

  constructor(page: Page) {
    super(page)
    this.reportTypeSelect = page.getByTestId('report-type-select')
    this.dateRangePicker = page.getByTestId('date-range-picker')
    this.generateButton = page.getByTestId('generate-report-button')
    this.reportsTable = page.getByRole('table')
    this.downloadButton = page.getByRole('button', {
      name: /download|descargar/i
    })
  }

  /**
   * Navigate to reports page
   */
  async goto() {
    await super.goto('/reports')
  }

  /**
   * Select report type
   */
  async selectReportType(type: ReportData['type']) {
    await this.reportTypeSelect.click()
    // Convert underscore to hyphen for data-testid
    const testId = `report-type-${type.replace(/_/g, '-')}`
    const option = this.page.getByTestId(testId)
    // Wait for the option to be visible before clicking
    await option.waitFor({ state: 'visible', timeout: 15000 })
    await option.click()
  }

  /**
   * Select date range
   */
  async selectDateRange(startDate: string, endDate: string) {
    // Open date picker
    await this.dateRangePicker.click()

    // Parse dates to extract day numbers
    const [startYear, startMonth, startDay] = startDate.split('-')
    const [endYear, endMonth, endDay] = endDate.split('-')

    // Click start date - find button containing the day number
    // The calendar shows dates like "Wednesday, January 1st, 2025" with just "1" as text
    await this.page
      .getByRole('button')
      .filter({ hasText: new RegExp(`^${parseInt(startDay)}$`) })
      .first()
      .click()

    // Click end date - find button containing the day number
    await this.page
      .getByRole('button')
      .filter({ hasText: new RegExp(`^${parseInt(endDay)}$`) })
      .first()
      .click()
  }

  /**
   * Generate a report
   */
  async generateReport(data: ReportData) {
    await this.selectReportType(data.type)
    await this.selectDateRange(data.startDate, data.endDate)
    await this.generateButton.click()
  }

  /**
   * Expect report generation to start
   */
  async expectReportGenerating() {
    // Check for "Generating" state in button
    await expect(this.generateButton).toContainText(/generating|generando/i)
  }

  /**
   * Expect report to be generated successfully
   */
  async expectReportGenerated() {
    await this.expectSuccessToast(/report.*generated|reporte.*generado/i)
  }

  /**
   * Wait for report to appear in table (real-time via Ably)
   */
  async waitForReportInTable(reportType: string, timeout = 30000) {
    const row = this.reportsTable
      .getByRole('row', {
        name: new RegExp(reportType, 'i')
      })
      .first()
    await expect(row).toBeVisible({ timeout })
  }

  /**
   * Download a report
   */
  async downloadReport(reportName: string) {
    const row = this.reportsTable.getByRole('row', {
      name: new RegExp(reportName, 'i')
    })
    await row.locator(this.downloadButton).click()
  }

  /**
   * Expect download to start
   */
  async expectDownloadStarted() {
    // Wait for download event
    const downloadPromise = this.page.waitForEvent('download')
    const download = await downloadPromise
    expect(download).toBeTruthy()
    return download
  }
}

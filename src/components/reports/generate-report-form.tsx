'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useTranslations } from 'next-intl'
import { DateRangePicker } from '@/components/reports/date-range-picker'
import { DateRange } from 'react-day-picker'

export function GenerateReportForm() {
  const t = useTranslations('reports')
  const [reportType, setReportType] = useState<string>('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const handleGenerateReport = () => {
    if (!reportType || !dateRange?.from || !dateRange?.to) {
      return
    }

    const reportData = {
      reportType,
      dateRange: {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      }
    }

    // TODO: Implement report generation logic
    console.log('Generating report:', reportData)
  }

  const isFormValid = reportType && dateRange?.from && dateRange?.to

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label
            htmlFor="report-type"
            className="text-sm font-medium mb-2 block"
          >
            {t('generateForm.reportTypeLabel')}
          </label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger id="report-type" className="w-full">
              <SelectValue
                placeholder={t('generateForm.reportTypePlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">
                {t('generateForm.reportTypes.sales')}
              </SelectItem>
              <SelectItem value="orders">
                {t('generateForm.reportTypes.orders')}
              </SelectItem>
              <SelectItem value="stock">
                {t('generateForm.reportTypes.stock')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">
            {t('generateForm.dateRangeLabel')}
          </label>
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>

        <Button
          onClick={handleGenerateReport}
          disabled={!isFormValid}
          className="md:w-auto w-full"
        >
          {t('generateForm.generateButton')}
        </Button>
      </div>
    </div>
  )
}

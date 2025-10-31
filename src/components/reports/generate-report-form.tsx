'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { toast } from 'sonner'

export function GenerateReportForm() {
  const t = useTranslations('reports')
  const [reportType, setReportType] = useState<string>('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const queryClient = useQueryClient()

  const generateReportMutation = useMutation({
    mutationFn: async (reportData: {
      report_type: string
      start_date: string
      end_date: string
    }) => {
      const accessToken = localStorage.getItem('access_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bff/web/reports`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reportData)
        }
      )
      if (!response.ok) {
        throw new Error('Failed to generate report')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch reports
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success(t('generateForm.success'))
      // Reset form
      setReportType('')
      setDateRange(undefined)
    },
    onError: (error) => {
      console.error('Generate report error:', error)
      toast.error(t('generateForm.error'))
    }
  })

  const handleGenerateReport = () => {
    if (!reportType || !dateRange?.from || !dateRange?.to) {
      return
    }

    const reportData = {
      report_type: reportType,
      start_date: dateRange.from.toISOString(),
      end_date: dateRange.to.toISOString()
    }

    generateReportMutation.mutate(reportData)
  }

  const isFormValid = reportType && dateRange?.from && dateRange?.to

  return (
    <div className="space-y-4" data-testid="generate-report-form">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label
            htmlFor="report-type"
            className="text-sm font-medium mb-2 block"
          >
            {t('generateForm.reportTypeLabel')}
          </label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger
              id="report-type"
              className="w-full"
              data-testid="report-type-select"
            >
              <SelectValue
                placeholder={t('generateForm.reportTypePlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="orders_per_seller"
                data-testid="report-type-orders-per-seller"
              >
                {t('generateForm.reportTypes.orders_per_seller')}
              </SelectItem>
              <SelectItem value="low_stock" data-testid="report-type-low-stock">
                {t('generateForm.reportTypes.low_stock')}
              </SelectItem>
              <SelectItem
                value="orders_per_status"
                data-testid="report-type-orders-per-status"
              >
                {t('generateForm.reportTypes.orders_per_status')}
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
          disabled={!isFormValid || generateReportMutation.isPending}
          className="md:w-auto w-full"
          data-testid="generate-report-button"
        >
          {generateReportMutation.isPending
            ? t('generateForm.generating')
            : t('generateForm.generateButton')}
        </Button>
      </div>
    </div>
  )
}

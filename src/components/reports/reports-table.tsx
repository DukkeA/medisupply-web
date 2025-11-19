'use client'

import { useMutation } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  useListReportsBffWebReportsGet,
  getReportBffWebReportsReportIdGet
} from '@/generated'
import type { ReportResponse } from '@/generated'

export function ReportsTable() {
  const t = useTranslations('reports')

  const { data, isLoading, isError } = useListReportsBffWebReportsGet()

  const downloadReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      return getReportBffWebReportsReportIdGet(reportId)
    },
    onSuccess: async (reportData) => {
      if (reportData.download_url) {
        try {
          // Fetch the file and create a blob URL to force download
          const response = await fetch(reportData.download_url)
          const blob = await response.blob()
          const blobUrl = URL.createObjectURL(blob)

          // Create temporary anchor element to trigger download
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = `report-${reportData.id}.json`
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // Clean up the blob URL
          URL.revokeObjectURL(blobUrl)

          toast.success(t('download.success'))
        } catch (error) {
          console.error('Download failed:', error)
          toast.error(t('download.error'))
        }
      } else {
        toast.error(t('download.noUrl'))
      }
    },
    onError: (error) => {
      console.error('Download error:', error)
      toast.error(t('download.error'))
    }
  })

  const handleDownload = (report: ReportResponse) => {
    downloadReportMutation.mutate(report.id)
  }

  if (isLoading) {
    return <div data-testid="reports-loading">{t('table.loading')}</div>
  }

  if (isError) {
    return <div data-testid="reports-error">{t('table.error')}</div>
  }

  return (
    <div className="space-y-4" data-testid="reports-table">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{t('table.columns.id')}</TableHead>
            <TableHead>{t('table.columns.reportType')}</TableHead>
            <TableHead>{t('table.columns.dateRange')}</TableHead>
            <TableHead>{t('table.columns.createdAt')}</TableHead>
            <TableHead>{t('table.columns.status')}</TableHead>
            <TableHead className="text-right">
              {t('table.columns.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!data || !data.items || data.items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center"
                data-testid="reports-no-data"
              >
                {t('table.noData')}
              </TableCell>
            </TableRow>
          ) : (
            data.items.map((report: ReportResponse) => (
              <TableRow key={report.id} data-testid={`report-row-${report.id}`}>
                <TableCell
                  className="font-medium"
                  data-testid={`report-id-${report.id}`}
                >
                  {report.id}
                </TableCell>
                <TableCell data-testid={`report-type-${report.id}`}>
                  {t(`table.reportTypes.${report.report_type}`)}
                </TableCell>
                <TableCell data-testid={`report-dates-${report.id}`}>
                  {report.start_date?.slice(0, 10)} -{' '}
                  {report.end_date?.slice(0, 10)}
                </TableCell>
                <TableCell data-testid={`report-created-${report.id}`}>
                  {report.created_at}
                </TableCell>
                <TableCell data-testid={`report-status-${report.id}`}>
                  {t(`table.statuses.${report.status}`)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(report)}
                    disabled={
                      downloadReportMutation.isPending ||
                      report.status !== 'completed'
                    }
                    data-testid={`download-button-${report.id}`}
                  >
                    <Download className="h-4 w-4" />
                    {downloadReportMutation.isPending &&
                      downloadReportMutation.variables === report.id && (
                        <span className="ml-2">...</span>
                      )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

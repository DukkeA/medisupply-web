'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
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

interface Report {
  id: string
  report_type: string
  status: string
  start_date?: string
  end_date?: string
  created_at: string
  completed_at?: string
  download_url?: string
  error_message?: string
}

interface PaginatedReportsResponse {
  items: Report[]
  total: number
  page: number
  size: number
  has_next: boolean
  has_previous: boolean
}

export function ReportsTable() {
  const t = useTranslations('reports')

  const { data, isLoading, isError } = useQuery<PaginatedReportsResponse>({
    queryKey: ['reports'],
    queryFn: async () => {
      const accessToken = localStorage.getItem('access_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bff/web/reports`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    refetchInterval: 3000, // Refetch every 3 seconds
    refetchIntervalInBackground: false, // Only refetch when tab is active
    refetchOnWindowFocus: true
  })

  const downloadReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const accessToken = localStorage.getItem('access_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bff/web/reports/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (!response.ok) {
        throw new Error('Failed to get download URL')
      }
      return response.json()
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

  const handleDownload = (report: Report) => {
    downloadReportMutation.mutate(report.id)
  }

  if (isLoading) {
    return <div>{t('table.loading')}</div>
  }

  if (isError) {
    return <div>{t('table.error')}</div>
  }

  return (
    <div className="space-y-4">
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
              <TableCell colSpan={6} className="h-24 text-center">
                {t('table.noData')}
              </TableCell>
            </TableRow>
          ) : (
            data.items.map((report: Report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.id}</TableCell>
                <TableCell>
                  {t(`table.reportTypes.${report.report_type}`)}
                </TableCell>
                <TableCell>
                  {report.start_date?.slice(0, 10)} -{' '}
                  {report.end_date?.slice(0, 10)}
                </TableCell>
                <TableCell>{report.created_at}</TableCell>
                <TableCell>{t(`table.statuses.${report.status}`)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(report)}
                    disabled={
                      downloadReportMutation.isPending ||
                      report.status !== 'completed'
                    }
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

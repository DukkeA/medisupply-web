'use client'

import { useQuery } from '@tanstack/react-query'
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

interface Report {
  id: number
  reportType: string
  createdAt: string
  status: string
  dateRange: {
    from: string
    to: string
  }
  s3Link?: string
}

const testData: Report[] = [
  {
    id: 1,
    reportType: 'sales',
    createdAt: '2024-01-15',
    status: 'completed',
    dateRange: { from: '2024-01-01', to: '2024-01-15' },
    s3Link: 'https://example.com/report1.pdf'
  },
  {
    id: 2,
    reportType: 'orders',
    createdAt: '2024-01-16',
    status: 'completed',
    dateRange: { from: '2024-01-01', to: '2024-01-16' },
    s3Link: 'https://example.com/report2.pdf'
  },
  {
    id: 3,
    reportType: 'stock',
    createdAt: '2024-01-17',
    status: 'in_progress',
    dateRange: { from: '2024-01-01', to: '2024-01-17' },
    s3Link: ''
  }
]

export function ReportsTable() {
  const t = useTranslations('reports')

  const { data, isLoading, isError } = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(testData)
        }, 1000)
      })
    }
  })

  const handleDownload = (report: Report) => {
    // TODO: Implement download logic
    console.log('Downloading report:', report.id)
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
          {!data || data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {t('table.noData')}
              </TableCell>
            </TableRow>
          ) : (
            data.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.id}</TableCell>
                <TableCell>
                  {t(`table.reportTypes.${report.reportType}`)}
                </TableCell>
                <TableCell>
                  {report.dateRange.from} - {report.dateRange.to}
                </TableCell>
                <TableCell>{report.createdAt}</TableCell>
                <TableCell>{t(`table.statuses.${report.status}`)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(report)}
                    disabled={!report.s3Link}
                  >
                    <Download className="h-4 w-4" />
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

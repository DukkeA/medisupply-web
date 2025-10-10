'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { CreateVendorModal } from '@/components/vendors/create-vendor-modal'
import { Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import testData from './test-data.json'
import { useTranslations } from 'next-intl'

export type Vendor = {
  id: string
  name: string
  email: string
  phone: string
  country: string
  territory: string
}

export function VendorsTable() {
  const t = useTranslations('vendors')
  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // fetch vendors data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await fetch('/api/vendors')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    ...(process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && {
      initialData: testData
    })
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading vendors.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('table.addButton')}
        </Button>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('table.columns.name')}</TableHead>
              <TableHead>{t('table.columns.email')}</TableHead>
              <TableHead>{t('table.columns.phone')}</TableHead>
              <TableHead>{t('table.columns.country')}</TableHead>
              <TableHead>{t('table.columns.territory')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t('table.noData')}
                </TableCell>
              </TableRow>
            ) : (
              data.map((vendor: Vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>{vendor.phone}</TableCell>
                  <TableCell>{vendor.country}</TableCell>
                  <TableCell>{vendor.territory}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateVendorModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}

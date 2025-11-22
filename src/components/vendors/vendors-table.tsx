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
import { useGetSellersBffWebSellersGet } from '@/generated'
import type { SellerResponse, PaginatedSellersResponse } from '@/generated'
import { useTranslations } from 'next-intl'

export function VendorsTable() {
  const t = useTranslations('vendors')
  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // fetch vendors data
  const { data, isLoading, isError } = useGetSellersBffWebSellersGet({
    limit: 50
  })

  // Handle union type - data can be PaginatedSellersResponse or SellerResponse[]
  const vendorItems = data
    ? 'items' in data
      ? (data as PaginatedSellersResponse).items
      : (data as SellerResponse[])
    : []

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading vendors.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsModalOpen(true)}
          data-testid="add-vendor-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('table.addButton')}
        </Button>
      </div>

      <div>
        <Table data-testid="vendors-table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('table.columns.name')}</TableHead>
              <TableHead>{t('table.columns.email')}</TableHead>
              <TableHead>{t('table.columns.phone')}</TableHead>
              <TableHead>{t('table.columns.country')}</TableHead>
              {/* <TableHead>{t('table.columns.city')}</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendorItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t('table.noData')}
                </TableCell>
              </TableRow>
            ) : (
              vendorItems.map((vendor: SellerResponse) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>{vendor.phone}</TableCell>
                  <TableCell>{vendor.country}</TableCell>
                  {/* <TableCell>{vendor.city}</TableCell> */}
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

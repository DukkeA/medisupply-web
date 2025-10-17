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
import { AddToInventoryModal } from '@/components/inventory/add-to-inventory-modal'
import { Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import testData from './test-data.json'
import { useTranslations } from 'next-intl'

export type InventoryItem = {
  id: number
  product_id: string
  warehouse_id: number
  total_quantity: number
  reserved_quantity: number
  batch_number: string
  expiration_date: string
}

export function InventoryTable() {
  const t = useTranslations('inventory')
  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // fetch inventory data
  const { data, isLoading, isError } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/inventory`
      )
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
    return <div>Error loading inventory.</div>
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
              <TableHead>{t('table.columns.productId')}</TableHead>
              <TableHead>{t('table.columns.warehouseId')}</TableHead>
              <TableHead>{t('table.columns.totalQuantity')}</TableHead>
              <TableHead>{t('table.columns.reservedQuantity')}</TableHead>
              <TableHead>{t('table.columns.batchNumber')}</TableHead>
              <TableHead>{t('table.columns.expirationDate')}</TableHead>
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
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.product_id}
                  </TableCell>
                  <TableCell>{item.warehouse_id}</TableCell>
                  <TableCell>{item.total_quantity}</TableCell>
                  <TableCell>{item.reserved_quantity}</TableCell>
                  <TableCell>{item.batch_number}</TableCell>
                  <TableCell>{item.expiration_date}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddToInventoryModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}

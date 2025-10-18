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
import { useTranslations } from 'next-intl'
import { useInventory } from '@/services/hooks/use-inventory'
import { InventoryResponse } from '@/generated/models'
import testData from './test-data.json'

export function InventoryTable() {
  // TODO Agregar filtros por producto y almacen
  const t = useTranslations('inventory')
  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // fetch inventory data
  const { data, isLoading, isError } = useInventory(testData)

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
              <TableHead>{t('table.columns.productSku')}</TableHead>
              <TableHead>{t('table.columns.productName')}</TableHead>
              <TableHead>{t('table.columns.warehouseName')}</TableHead>
              <TableHead>{t('table.columns.totalQuantity')}</TableHead>
              <TableHead>{t('table.columns.reservedQuantity')}</TableHead>
              <TableHead>{t('table.columns.batchNumber')}</TableHead>
              <TableHead>{t('table.columns.expirationDate')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data || data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {t('table.noData')}
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((item: InventoryResponse) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.product_sku}
                  </TableCell>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.warehouse_name}</TableCell>
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

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
import { CreateWarehouseModal } from '@/components/inventory/warehouses/create-warehouse-modal'
import { Plus } from 'lucide-react'
import { useWarehouses } from '@/services/hooks/use-warehouses'
import { WarehouseResponse } from '@/generated/models'
import testData from './test-data.json'
import { useTranslations } from 'next-intl'

export function WarehousesTable() {
  const t = useTranslations('warehouses')
  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // fetch warehouses data
  const { data, isLoading, isError } = useWarehouses(10, 0, testData)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading warehouses.</div>
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
              <TableHead>{t('table.columns.city')}</TableHead>
              <TableHead>{t('table.columns.country')}</TableHead>
              <TableHead>{t('table.columns.address')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data || data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {t('table.noData')}
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((warehouse: WarehouseResponse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="font-medium">
                    {warehouse.name}
                  </TableCell>
                  <TableCell>{warehouse.city}</TableCell>
                  <TableCell>{warehouse.country}</TableCell>
                  <TableCell>{warehouse.address}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateWarehouseModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}

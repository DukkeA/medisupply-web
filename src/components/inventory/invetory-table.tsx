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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { AddToInventoryModal } from '@/components/inventory/add-to-inventory-modal'
import { Plus, Filter, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useInventory } from '@/services/hooks/use-inventory'
import { useProducts } from '@/services/hooks/use-products'
import { useWarehouses } from '@/services/hooks/use-warehouses'
import { InventoryResponse } from '@/generated/models'
import testData from './test-data.json'

export function InventoryTable() {
  const t = useTranslations('inventory')
  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // filter states
  const [selectedSku, setSelectedSku] = useState<string>('')
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('')
  const [appliedSku, setAppliedSku] = useState<string | undefined>(undefined)
  const [appliedWarehouse, setAppliedWarehouse] = useState<string | undefined>(
    undefined
  )

  // fetch data for filters
  const { data: productsData } = useProducts(100, 0)
  const { data: warehousesData } = useWarehouses(100, 0)

  // fetch inventory data with applied filters
  const { data, isLoading, isError } = useInventory(
    appliedSku,
    appliedWarehouse,
    testData
  )

  const handleApplyFilters = () => {
    setAppliedSku(selectedSku || undefined)
    setAppliedWarehouse(selectedWarehouse || undefined)
  }

  const handleClearFilters = () => {
    setSelectedSku('')
    setSelectedWarehouse('')
    setAppliedSku(undefined)
    setAppliedWarehouse(undefined)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading inventory.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {/* SKU Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              {t('filters.selectSku')}
            </label>
            <Select value={selectedSku} onValueChange={setSelectedSku}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder={t('filters.selectSkuPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {productsData?.items.map((product) => (
                  <SelectItem key={product.sku} value={product.sku}>
                    {product.sku} - {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Warehouse Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              {t('filters.selectWarehouse')}
            </label>
            <Select
              value={selectedWarehouse}
              onValueChange={setSelectedWarehouse}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue
                  placeholder={t('filters.selectWarehousePlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                {warehousesData?.items.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} variant="default">
              <Filter className="mr-2 h-4 w-4" />
              {t('filters.applyButton')}
            </Button>
            <Button onClick={handleClearFilters} variant="outline">
              <X className="mr-2 h-4 w-4" />
              {t('filters.clearButton')}
            </Button>
          </div>
        </div>

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
                  <TableCell>{item.expiration_date.slice(0, 10)}</TableCell>
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

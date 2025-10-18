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
import { CreateProductModal } from '@/components/products/create-product-modal'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CreateProductCSVModal } from '@/components/products/create-product-csv-modal'
import { useProducts } from '@/services/hooks/use-products'
import { ProductResponse } from '@/generated/models'
import testData from './test-data.json'

export function ProductsTable() {
  const t = useTranslations('products')
  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)

  // fetch products data
  const { data, isLoading, isError } = useProducts(10, 0, testData)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError || !data) {
    return <div>Error loading products.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-4">
        <Button data-testid="add-product-button" variant="outline" onClick={() => setIsCSVModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('table.addCSVButton')}
        </Button>
        <Button data-testid="import-csv-button"  onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('table.addButton')}
        </Button>
      </div>

      <div>
        <Table data-testid="products-table" role="table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('table.columns.sku')}</TableHead>
              <TableHead>{t('table.columns.name')}</TableHead>
              <TableHead>{t('table.columns.category')}</TableHead>
              <TableHead>{t('table.columns.price')}</TableHead>
              <TableHead>{t('table.columns.provider')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {t('table.noData')}
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((product: ProductResponse) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.provider_id}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateProductModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <CreateProductCSVModal
        open={isCSVModalOpen}
        onOpenChange={setIsCSVModalOpen}
      />
    </div>
  )
}

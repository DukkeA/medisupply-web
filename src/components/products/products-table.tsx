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
import { useQuery } from '@tanstack/react-query'
import testData from './test-data.json'
import { useTranslations } from 'next-intl'
import { Checkbox } from '@/components/ui/checkbox'
import { CreateProductCSVModal } from '@/components/products/create-product-csv-modal'

export type Product = {
  id: string
  sku: string
  name: string
  category: string
  price: number
  refrigerated: boolean
  provider: string
}

export function ProductsTable() {
  const t = useTranslations('products')
  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false)

  // fetch products data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`
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
    return <div>Error loading products.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => setIsCSVModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('table.addCSVButton')}
        </Button>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('table.addButton')}
        </Button>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('table.columns.sku')}</TableHead>
              <TableHead>{t('table.columns.name')}</TableHead>
              <TableHead>{t('table.columns.category')}</TableHead>
              <TableHead>{t('table.columns.price')}</TableHead>
              <TableHead>{t('table.columns.refrigerated')}</TableHead>
              <TableHead>{t('table.columns.provider')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {t('table.noData')}
                </TableCell>
              </TableRow>
            ) : (
              data.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>
                    <Checkbox checked={product.refrigerated} />
                  </TableCell>
                  <TableCell>{product.provider}</TableCell>
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

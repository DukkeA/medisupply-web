'use client'

import { ProductsTable } from '@/components/products/products-table'
import { useTranslations } from 'next-intl'

export default function ProductsPage() {
  const t = useTranslations('products')

  return (
    <main className="container mx-auto py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('page.title')}
          </h1>
          <p className="text-muted-foreground">{t('page.description')}</p>
        </div>
        <ProductsTable />
      </div>
    </main>
  )
}

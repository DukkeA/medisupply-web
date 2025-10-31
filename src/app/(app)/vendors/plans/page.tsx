'use client'

import { VendorPlansTable } from '@/components/vendors/vendors-plans/vendor-plans-table'
import { useTranslations } from 'next-intl'

export default function VendorsPlansPage() {
  const t = useTranslations('vendorPlans')

  return (
    <main className="container mx-auto py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('page.title')}
          </h1>
          <p className="text-muted-foreground">{t('page.description')}</p>
        </div>
        <VendorPlansTable />
      </div>
    </main>
  )
}

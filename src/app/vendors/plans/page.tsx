'use client'

import { VendorPlansTable } from '@/components/vendors/vendors-plans/vendor-plans-table'
import { CreateVendorPlanModal } from '@/components/vendors/vendors-plans/create-vendor-plan-modal'
import { useTranslations } from 'next-intl'

export default function VendorsPlansPage() {
  const t = useTranslations('vendorPlans')

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
        <CreateVendorPlanModal />
      </div>
      <div className="space-y-4">
        <VendorPlansTable />
      </div>
    </div>
  )
}

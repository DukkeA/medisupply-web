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
import { CreateVendorPlanModal } from './create-vendor-plan-modal'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSalesPlans } from '@/services/hooks/use-sales-plans'
import { SalesPlanResponse } from '@/generated/models'
import testData from './test-data.json'

export function VendorPlansTable() {
  const t = useTranslations('vendorPlans')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    data: vendorPlans,
    isLoading,
    isError
  } = useSalesPlans(10, 0, testData)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Exceeded':
        return 'text-green-600 font-semibold'
      case 'On Track':
        return 'text-blue-600 font-semibold'
      case 'Below Target':
        return 'text-red-600 font-semibold'
      default:
        return ''
    }
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount))
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading vendor plans.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('create')}
        </Button>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('vendor')}</TableHead>
              <TableHead>{t('period')}</TableHead>
              <TableHead>{t('goal')}</TableHead>
              <TableHead>{t('actual')}</TableHead>
              <TableHead>{t('status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!vendorPlans || vendorPlans.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            ) : (
              vendorPlans.items.map((plan: SalesPlanResponse) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    {plan.seller.name}
                  </TableCell>
                  <TableCell>{plan.sales_period}</TableCell>
                  <TableCell>{formatCurrency(plan.goal)}</TableCell>
                  <TableCell>{formatCurrency(plan.accumulate)}</TableCell>
                  <TableCell className={getStatusColor(plan.status)}>
                    {plan.status}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateVendorPlanModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}

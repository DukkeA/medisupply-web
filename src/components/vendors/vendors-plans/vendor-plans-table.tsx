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
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import testData from './test-data.json'

interface VendorPlan {
  id: string
  seller_id: string
  seller_name: string
  sales_period: string
  goal: number
  goal_type: string
  accumulate: number
  status: string
}

export function VendorPlansTable() {
  const t = useTranslations('vendorPlans')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    data: vendorPlans,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['vendorPlans'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sales-plans`
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
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
            {!vendorPlans || vendorPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            ) : (
              vendorPlans.items.map((plan: VendorPlan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    {plan.seller_name}
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

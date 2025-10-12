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
import vendorsTestData from './vendors-mock-data.json'

interface VendorPlan {
  id: number
  vendor_id: number
  period: string
  goal: number
  actual: number
  status: string
}

interface Vendor {
  id: number
  name: string
}

export function VendorPlansTable() {
  const t = useTranslations('vendorPlans')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    data: vendorPlans,
    isLoading,
    isError
  } = useQuery<VendorPlan[]>({
    queryKey: ['vendorPlans'],
    queryFn: async () => {
      const response = await fetch('/api/vendor-plans')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    ...(process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && {
      initialData: testData
    })
  })

  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await fetch('/api/vendors')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    ...(process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && {
      initialData: vendorsTestData
    })
  })

  const getVendorName = (vendorId: number) => {
    const vendor = vendors?.find((v) => v.id === vendorId)
    return vendor?.name || `Vendor ${vendorId}`
  }

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
              vendorPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    {getVendorName(plan.vendor_id)}
                  </TableCell>
                  <TableCell>{plan.period}</TableCell>
                  <TableCell>{formatCurrency(plan.goal)}</TableCell>
                  <TableCell>{formatCurrency(plan.actual)}</TableCell>
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

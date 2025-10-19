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
import { CreateProviderModal } from '@/components/proveedores/create-provider-modal'
import { Plus } from 'lucide-react'
import { useProviders } from '@/services/hooks/use-providers'
import { ProviderResponse } from '@/generated/models'
import testData from './test-data.json'
import { useTranslations } from 'next-intl'

export function ProvidersTable() {
  const t = useTranslations('providers')
  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // fetch providers data
  const { data, isLoading, isError } = useProviders(10, 0, testData)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading providers.</div>
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
              <TableHead>{t('table.columns.company')}</TableHead>
              <TableHead>{t('table.columns.nit')}</TableHead>
              <TableHead>{t('table.columns.email')}</TableHead>
              <TableHead>{t('table.columns.phone')}</TableHead>
              <TableHead>{t('table.columns.address')}</TableHead>
              <TableHead>{t('table.columns.country')}</TableHead>
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
              data.items.map((provider: ProviderResponse) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">{provider.name}</TableCell>
                  <TableCell>{provider.contact_name}</TableCell>
                  <TableCell>{provider.nit}</TableCell>
                  <TableCell>{provider.email}</TableCell>
                  <TableCell>{provider.phone}</TableCell>
                  <TableCell>{provider.address}</TableCell>
                  <TableCell>{provider.country}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateProviderModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}

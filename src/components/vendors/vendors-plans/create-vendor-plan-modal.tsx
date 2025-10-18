'use client'

import type React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/utils/classNames'
import testData from './vendors-mock-data.json'

interface Vendor {
  id: number
  name: string
}

interface VendorPlanFormData {
  seller_id: number
  sales_period: string
  goal: number
  accumulate?: number
  status: string
}

type CreateVendorPlanModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateVendorPlanModal({
  open,
  onOpenChange
}: CreateVendorPlanModalProps) {
  const t = useTranslations('vendorPlans')
  const [openVendorSelect, setOpenVendorSelect] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null)
  const [formData, setFormData] = useState<VendorPlanFormData>({
    seller_id: 0,
    sales_period: '',
    goal: 0,
    accumulate: 0,
    status: 'active'
  })

  const queryClient = useQueryClient()

  const { data: vendors } = useQuery<{ items: Vendor[] }>({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sellers`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    ...(process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && {
      initialData: { items: testData }
    })
  })

  const mutation = useMutation({
    mutationKey: ['create-vendor-plan'],
    mutationFn: async (newPlan: VendorPlanFormData) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sales-plans`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(newPlan)
        }
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorPlans'] })
      toast.success(t('createSuccess'))
      onOpenChange(false)
      resetForm()
    },
    onError: () => {
      toast.error(t('createError'))
    }
  })

  const resetForm = () => {
    setFormData({
      seller_id: 0,
      sales_period: '',
      goal: 0,
      accumulate: 0,
      status: 'active'
    })
    setSelectedVendorId(null)
  }

  const handleChange = (
    field: keyof VendorPlanFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVendorId) {
      toast.error(t('selectVendor'))
      return
    }
    mutation.mutate({ ...formData, seller_id: selectedVendorId })
  }

  const selectedVendor = vendors?.items.find((v) => v.id === selectedVendorId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('createTitle')}</DialogTitle>
          <DialogDescription>{t('createDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Vendor Select */}
            <div className="grid gap-2">
              <Label htmlFor="vendor">{t('vendor')}</Label>
              <Popover
                open={openVendorSelect}
                onOpenChange={setOpenVendorSelect}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openVendorSelect}
                    className="justify-between"
                  >
                    {selectedVendor ? selectedVendor.name : t('selectVendor')}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder={t('searchVendor')} />
                    <CommandList>
                      <CommandEmpty>{t('noVendorFound')}</CommandEmpty>
                      <CommandGroup>
                        {vendors?.items.map((vendor) => (
                          <CommandItem
                            key={vendor.id}
                            value={`${vendor.id} ${vendor.name}`}
                            onSelect={() => {
                              setSelectedVendorId(vendor.id)
                              setOpenVendorSelect(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedVendorId === vendor.id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {vendor.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Period */}
            <div className="grid gap-2">
              <Label htmlFor="period">{t('period')}</Label>
              <Input
                id="sales_period"
                placeholder="Q1 2024"
                value={formData.sales_period}
                onChange={(e) => handleChange('sales_period', e.target.value)}
                required
              />
            </div>

            {/* Goal */}
            <div className="grid gap-2">
              <Label htmlFor="goal">{t('goal')}</Label>
              <Input
                id="goal"
                type="number"
                placeholder="50000"
                value={formData.goal || ''}
                onChange={(e) => handleChange('goal', Number(e.target.value))}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

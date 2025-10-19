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
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/utils/classNames'
import { useSellers, useCreateSalesPlan } from '@/services'
import { SalesPlanCreate } from '@/generated/models'

type CreateVendorPlanModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SalesPlanFormData = Omit<SalesPlanCreate, 'goal'> & { goal: number }

export function CreateVendorPlanModal({
  open,
  onOpenChange
}: CreateVendorPlanModalProps) {
  const t = useTranslations('vendorPlans')
  const [openVendorSelect, setOpenVendorSelect] = useState(false)
  const [formData, setFormData] = useState<SalesPlanFormData>({
    seller_id: '',
    sales_period: '',
    goal: 0
  })

  // mutation to create a new sales plan
  const { mutate: createSalesPlanMutation, isPending } = useCreateSalesPlan()

  // query vendors/sellers to populate vendor select
  const { data: vendors } = useSellers()

  // form handlers
  const resetForm = () => {
    setFormData({
      seller_id: '',
      sales_period: '',
      goal: 0
    })
  }

  const handleChange = (field: keyof SalesPlanFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.seller_id) {
      toast.error(t('selectVendor'))
      return
    }
    // Convert goal number to Goal object for API
    const salesPlanData: SalesPlanCreate = {
      ...formData,
      goal: formData.goal as unknown as SalesPlanCreate['goal']
    }
    createSalesPlanMutation(salesPlanData, {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(t('createSuccess'))
        resetForm()
      },
      onError: () => {
        toast.error(t('createError'))
      }
    })
  }

  const selectedVendor = vendors?.items.find((v) => v.id === formData.seller_id)

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
                              handleChange('seller_id', vendor.id)
                              setOpenVendorSelect(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.seller_id === vendor.id
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
              <Label htmlFor="sales_period">{t('period')}</Label>
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    goal: Number(e.target.value) || 0
                  }))
                }
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

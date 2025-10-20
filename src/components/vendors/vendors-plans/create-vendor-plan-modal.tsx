'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
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
import { toast } from 'sonner'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/utils/classNames'
import { useSellers, useCreateSalesPlan } from '@/services'
import {
  createSalesPlanSchema,
  type SalesPlanFormData
} from '@/lib/validations/sales-plan-schema'

type CreateVendorPlanModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateVendorPlanModal({
  open,
  onOpenChange
}: CreateVendorPlanModalProps) {
  const t = useTranslations('vendorPlans')
  const tValidation = useTranslations()
  const [openVendorSelect, setOpenVendorSelect] = useState(false)

  // Initialize form with validation
  const form = useForm<SalesPlanFormData>({
    resolver: zodResolver(createSalesPlanSchema(tValidation)),
    mode: 'onChange',
    defaultValues: {
      seller_id: '',
      sales_period: '',
      goal: 0
    }
  })

  // mutation to create a new sales plan
  const { mutate: createSalesPlanMutation, isPending } = useCreateSalesPlan()

  // query vendors/sellers to populate vendor select
  const { data: vendors } = useSellers()

  // form handlers
  const handleSubmit = (data: SalesPlanFormData) => {
    createSalesPlanMutation(data, {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(t('createSuccess'))
        form.reset()
      },
      onError: () => {
        toast.error(t('createError'))
      }
    })
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  const selectedVendor = vendors?.items.find(
    (v) => v.id === form.watch('seller_id')
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('createTitle')}</DialogTitle>
          <DialogDescription>{t('createDescription')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Vendor Select */}
              <FormField
                control={form.control}
                name="seller_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vendor')}</FormLabel>
                    <FormControl>
                      <Popover
                        open={openVendorSelect}
                        onOpenChange={setOpenVendorSelect}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openVendorSelect}
                            className="w-full justify-between"
                          >
                            {selectedVendor
                              ? selectedVendor.name
                              : t('selectVendor')}
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
                                      field.onChange(vendor.id)
                                      setOpenVendorSelect(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value === vendor.id
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sales Period */}
              <FormField
                control={form.control}
                name="sales_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('period')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Q1-2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Goal */}
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('goal')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="50000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
              >
                {isPending ? t('creating') : t('create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

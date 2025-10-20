'use client'

import type React from 'react'

import { useEffect } from 'react'
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
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import LocationSelector from '../../ui/location-input'
import { useCreateWarehouse } from '@/services/hooks/use-warehouses'
import {
  createWarehouseSchema,
  type WarehouseFormData
} from '@/lib/validations/warehouse-schema'

type CreateWarehouseModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWarehouseModal({
  open,
  onOpenChange
}: CreateWarehouseModalProps) {
  const t = useTranslations('warehouses')
  const tValidation = useTranslations()

  // Initialize form with validation (using translation)
  const form = useForm<WarehouseFormData>({
    resolver: zodResolver(createWarehouseSchema(tValidation)),
    mode: 'onChange',
    defaultValues: {
      name: '',
      address: '',
      country: '',
      city: ''
    }
  })

  // mutation to create a new warehouse
  const { mutate: createWarehouseMutation, isPending } = useCreateWarehouse()

  // form handlers
  const handleSubmit = (data: WarehouseFormData) => {
    createWarehouseMutation(data, {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(t('modal.toastSuccess'))
        form.reset()
      },
      onError: () => {
        toast.error(t('modal.toastError'))
      }
    })
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg ">
        <DialogHeader>
          <DialogTitle>{t('modal.title')}</DialogTitle>
          <DialogDescription>{t('modal.description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Warehouse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country and City using LocationSelector */}
              <LocationSelector
                showStates={true}
                countryLabel={t('modal.fields.country')}
                stateLabel={t('modal.fields.city')}
                onCountryChange={(country) => {
                  form.setValue('country', country?.name || '', {
                    shouldValidate: true
                  })
                }}
                onStateChange={(state) => {
                  form.setValue('city', state?.name || '', {
                    shouldValidate: true
                  })
                }}
              />

              {/* Display errors for country and city */}
              {form.formState.errors.country && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.country.message}
                </p>
              )}
              {form.formState.errors.city && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.city.message}
                </p>
              )}

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.address')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main St, New York, USA"
                        {...field}
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
                {t('modal.buttons.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
              >
                {isPending
                  ? t('modal.buttons.creating')
                  : t('modal.buttons.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

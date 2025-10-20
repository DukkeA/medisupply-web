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
import LocationSelector from '../ui/location-input'
import { useCreateSeller } from '@/services/hooks/use-sellers'
import {
  createSellerSchema,
  type SellerFormData
} from '@/lib/validations/seller-schema'

type CreateVendorModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateVendorModal({
  open,
  onOpenChange
}: CreateVendorModalProps) {
  const t = useTranslations('vendors')
  const tValidation = useTranslations()

  // Initialize form with validation
  const form = useForm<SellerFormData>({
    resolver: zodResolver(createSellerSchema(tValidation)),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      country: '',
      city: ''
    }
  })

  // mutation to create a new vendor
  const { mutate: createVendorMutation, isPending } = useCreateSeller()

  // form handlers
  const handleSubmit = (data: SellerFormData) => {
    createVendorMutation(data, {
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
              {/* Vendor Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.email')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.phone')}</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 234 567 8900"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country and City using LocationSelector */}
              <LocationSelector
                showStates={true}
                countryLabel={t('modal.fields.country')}
                stateLabel={t('modal.fields.territory')}
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

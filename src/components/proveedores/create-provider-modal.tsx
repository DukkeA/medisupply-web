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
import { useCreateProvider } from '@/services/hooks/use-providers'
import {
  createProviderSchema,
  type ProviderFormData
} from '@/lib/validations/provider-schema'

type CreateProviderModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProviderModal({
  open,
  onOpenChange
}: CreateProviderModalProps) {
  const t = useTranslations('providers')
  const tValidation = useTranslations()

  // Initialize form with validation (using translation)
  const form = useForm<ProviderFormData>({
    resolver: zodResolver(createProviderSchema(tValidation)),
    mode: 'onChange',
    defaultValues: {
      name: '',
      contact_name: '',
      nit: '',
      email: '',
      phone: '',
      address: '',
      country: ''
    }
  })

  // mutation to create a new provider
  const { mutate: createProviderMutation, isPending } = useCreateProvider()

  // form handlers
  const handleSubmit = (data: ProviderFormData) => {
    createProviderMutation(data, {
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
          <form
            data-testid="provider-form"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="grid gap-4 py-4">
              {/* Provider Name */}
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

              {/* Contact Name (Company) */}
              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.company')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NIT */}
              <FormField
                control={form.control}
                name="nit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.nit')}</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789-0" {...field} />
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

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.address')}</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, Suite 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country using LocationSelector */}
              <LocationSelector
                countryLabel={t('modal.fields.country')}
                onCountryChange={(country) => {
                  form.setValue('country', country?.name || '', {
                    shouldValidate: true
                  })
                }}
              />

              {/* Display error for country */}
              {form.formState.errors.country && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.country.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                data-testid="cancel-provider"
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

'use client'

import type React from 'react'

import { useState } from 'react'
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
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import LocationSelector from '../ui/location-input'
import { useCreateSeller } from '@/services/hooks/use-sellers'
import { SellerCreate } from '@/generated/models'

type CreateVendorModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateVendorModal({
  open,
  onOpenChange
}: CreateVendorModalProps) {
  const t = useTranslations('vendors')

  // form state
  const [formData, setFormData] = useState<SellerCreate>({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: ''
  })

  // mutation to create a new vendor
  const { mutate: createVendorMutation, isPending } = useCreateSeller()

  // form handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createVendorMutation(formData, {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(t('modal.toastSuccess'))
        setFormData({
          name: '',
          email: '',
          phone: '',
          country: '',
          city: ''
        })
      },
      onError: () => {
        toast.error(t('modal.toastError'))
      }
    })
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg ">
        <DialogHeader>
          <DialogTitle>{t('modal.title')}</DialogTitle>
          <DialogDescription>{t('modal.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('modal.fields.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t('modal.fields.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{t('modal.fields.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 234 567 8900"
                required
              />
            </div>
            <LocationSelector
              showStates={true}
              countryLabel={t('modal.fields.country')}
              stateLabel={t('modal.fields.territory')}
              onCountryChange={(country) => {
                handleChange('country', country?.name || '')
              }}
              onStateChange={(state) => {
                handleChange('city', state?.name || '')
              }}
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
            <Button type="submit" disabled={isPending}>
              {isPending
                ? t('modal.buttons.creating')
                : t('modal.buttons.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

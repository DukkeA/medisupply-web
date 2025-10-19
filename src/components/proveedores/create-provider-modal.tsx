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
import { useCreateProvider } from '@/services/hooks/use-providers'
import { ProviderCreate } from '@/generated/models'

type CreateProviderModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProviderModal({
  open,
  onOpenChange
}: CreateProviderModalProps) {
  const t = useTranslations('providers')

  // form state
  const [formData, setFormData] = useState<ProviderCreate>({
    name: '',
    contact_name: '',
    nit: '',
    email: '',
    phone: '',
    address: '',
    country: ''
  })

  // mutation to create a new provider
  const { mutate: createProviderMutation, isPending } = useCreateProvider()

  // form handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createProviderMutation(formData, {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(t('modal.toastSuccess'))
        setFormData({
          name: '',
          contact_name: '',
          nit: '',
          email: '',
          phone: '',
          address: '',
          country: ''
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
        <form data-testid="provider-form" onSubmit={handleSubmit}>
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
              <Label htmlFor="company">{t('modal.fields.company')}</Label>
              <Input
                id="company"
                value={formData.contact_name}
                onChange={(e) => handleChange('contact_name', e.target.value)}
                placeholder="Acme Corp"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nit">{t('modal.fields.nit')}</Label>
              <Input
                id="nit"
                value={formData.nit}
                onChange={(e) => handleChange('nit', e.target.value)}
                placeholder="123456789-0"
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
            <div className="grid gap-2">
              <Label htmlFor="address">{t('modal.fields.address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main St, Suite 100"
                required
              />
            </div>
            <LocationSelector
              countryLabel={t('modal.fields.country')}
              onCountryChange={(country) => {
                handleChange('country', country?.name || '')
              }}
            />
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

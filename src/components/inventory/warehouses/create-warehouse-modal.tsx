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
import LocationSelector from '../../ui/location-input'
import { useCreateWarehouse } from '@/services/hooks/use-warehouses'
import { WarehouseCreate } from '@/generated/models'

type CreateWarehouseModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWarehouseModal({
  open,
  onOpenChange
}: CreateWarehouseModalProps) {
  const t = useTranslations('warehouses')

  // form state
  const [formData, setFormData] = useState<WarehouseCreate>({
    name: '',
    address: '',
    country: '',
    city: ''
  })

  // mutation to create a new warehouse
  const { mutate: createWarehouseMutation, isPending } = useCreateWarehouse()

  // form handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createWarehouseMutation(formData, {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(t('modal.toastSuccess'))
        setFormData({
          name: '',
          address: '',
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
                placeholder="Main Warehouse"
                required
              />
            </div>
            <LocationSelector
              showStates={true}
              countryLabel={t('modal.fields.country')}
              stateLabel={t('modal.fields.city')}
              onCountryChange={(country) => {
                handleChange('country', country?.name || '')
              }}
              onStateChange={(state) => {
                handleChange('city', state?.name || '')
              }}
            />
            <div className="grid gap-2">
              <Label htmlFor="address">{t('modal.fields.address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main St, New York, USA"
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

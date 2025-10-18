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
import { Switch } from '@/components/ui/switch'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

type CreateProductModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProductModal({
  open,
  onOpenChange
}: CreateProductModalProps) {
  // TODO - Convertir input de proveedor en un select con opciones de proveedores existentes
  // TODO - Poner ENUM de categorías y convertir input de categoría en un select
  // query client instance
  const queryClient = useQueryClient()
  const t = useTranslations('products')

  // form state
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    price: 0,
    provider_id: ''
  })

  // mutation to create a new product
  const { mutate: createProductMutation, isPending } = useMutation({
    mutationKey: ['create-product'],
    mutationFn: async (newProduct: typeof formData) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(newProduct)
        }
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    onSuccess: () => {
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('modal.toastSuccess'))
    },
    onError: () => {
      toast.error(t('modal.toastError'))
    }
  })

  // form handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createProductMutation(formData)
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
              <Label htmlFor="sku">{t('modal.fields.sku')}</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                placeholder="MED001"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">{t('modal.fields.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Paracetamol 500mg"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">{t('modal.fields.category')}</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="Analgésicos"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">{t('modal.fields.price')}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0
                  }))
                }
                placeholder="19.99"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provider">{t('modal.fields.provider')}</Label>
              <Input
                id="provider"
                value={formData.provider_id}
                onChange={(e) => handleChange('provider_id', e.target.value)}
                placeholder="FarmaPlus"
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

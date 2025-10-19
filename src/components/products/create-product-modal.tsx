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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useCreateProduct } from '@/services/hooks/use-products'
import { ProductCreate, ProductCategory } from '@/generated/models'
import { useProviders } from '@/services/hooks/use-providers'

type CreateProductModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProductModal({
  open,
  onOpenChange
}: CreateProductModalProps) {
  const t = useTranslations('products')

  // form state
  const [formData, setFormData] = useState<
    Omit<ProductCreate, 'price'> & { price: number }
  >({
    name: '',
    category: ProductCategory.Otros,
    sku: '',
    price: 0,
    provider_id: ''
  })

  // mutation to create a new product
  const { mutate: createProductMutation, isPending } = useCreateProduct()

  // query providers to populate provider select
  const { data: providers } = useProviders()

  // form handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const productData: ProductCreate = {
      ...formData,
      price: formData.price as unknown as ProductCreate['price']
    }
    createProductMutation(productData, {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(t('modal.toastSuccess'))
        // Reset form
        setFormData({
          name: '',
          category: ProductCategory.Otros,
          sku: '',
          price: 0,
          provider_id: ''
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
        <form role="form" onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="sku">{t('modal.fields.sku')}</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                placeholder="SKU-001"
                required
              />
            </div>
            <div className="grid gap-2 w-full">
              <Label htmlFor="category">{t('modal.fields.category')}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  handleChange('category', value as ProductCategory)
                }
                required
              >
                <SelectTrigger id="category">
                  <SelectValue
                    placeholder={t('modal.fields.categoryPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProductCategory.MedicamentosEspeciales}>
                    {t('modal.categories.medicamentosEspeciales')}
                  </SelectItem>
                  <SelectItem value={ProductCategory.InsumosQuirurgicos}>
                    {t('modal.categories.insumosQuirurgicos')}
                  </SelectItem>
                  <SelectItem value={ProductCategory.ReactivosDiagnosticos}>
                    {t('modal.categories.reactivosDiagnosticos')}
                  </SelectItem>
                  <SelectItem value={ProductCategory.EquiposBiomedicos}>
                    {t('modal.categories.equiposBiomedicos')}
                  </SelectItem>
                  <SelectItem value={ProductCategory.Otros}>
                    {t('modal.categories.otros')}
                  </SelectItem>
                </SelectContent>
              </Select>
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
              <Select
                value={formData.provider_id}
                onValueChange={(value) => handleChange('provider_id', value)}
                required
              >
                <SelectTrigger id="provider">
                  <SelectValue
                    placeholder={t('modal.fields.providerPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {providers?.items?.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

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
import { ProductCategory } from '@/generated/models'
import { useProviders } from '@/services/hooks/use-providers'
import {
  createProductSchema,
  type ProductFormData
} from '@/lib/validations/product-schema'

type CreateProductModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProductModal({
  open,
  onOpenChange
}: CreateProductModalProps) {
  const t = useTranslations('products')
  const tValidation = useTranslations()

  // Initialize form with validation (using translation)
  const form = useForm<ProductFormData>({
    resolver: zodResolver(createProductSchema(tValidation)),
    mode: 'onChange',
    defaultValues: {
      name: '',
      category: ProductCategory.Otros,
      sku: '',
      price: 0,
      provider_id: ''
    }
  })

  // mutation to create a new product
  const { mutate: createProductMutation, isPending } = useCreateProduct()

  // query providers to populate provider select
  const { data: providers } = useProviders()

  // form handlers
  const handleSubmit = (data: ProductFormData) => {
    createProductMutation(data, {
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
          <form role="form" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Product Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Paracetamol 500mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SKU */}
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.sku')}</FormLabel>
                    <FormControl>
                      <Input placeholder="SKU-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.category')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('modal.fields.categoryPlaceholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value={ProductCategory.MedicamentosEspeciales}
                        >
                          {t('modal.categories.medicamentosEspeciales')}
                        </SelectItem>
                        <SelectItem value={ProductCategory.InsumosQuirurgicos}>
                          {t('modal.categories.insumosQuirurgicos')}
                        </SelectItem>
                        <SelectItem
                          value={ProductCategory.ReactivosDiagnosticos}
                        >
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.price')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="19.99"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Provider */}
              <FormField
                control={form.control}
                name="provider_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('modal.fields.provider')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('modal.fields.providerPlaceholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {providers?.items?.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

import { z } from 'zod'
import { ProductCategory } from '@/generated/models'
import {
  createNameValidator,
  createPriceValidator,
  createUuidValidator
} from './index'

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>
) => string

export const createProductSchema = (t: TranslateFn) => {
  return z.object({
    name: createNameValidator(t, 255).refine((val) => val.length > 0, {
      message: t('validation.product.nameRequired')
    }),
    category: z.enum(
      [
        'medicamentos_especiales',
        'insumos_quirurgicos',
        'reactivos_diagnosticos',
        'equipos_biomedicos',
        'otros'
      ] as const,
      {
        message: t('validation.selectCategory')
      }
    ),
    sku: z
      .string()
      .trim()
      .min(1, { message: t('validation.sku.required') })
      .max(100, { message: t('validation.sku.maxLength') })
      .transform((val) => val.toUpperCase()),
    price: createPriceValidator(t),
    provider_id: createUuidValidator(t).refine((val) => val !== '', {
      message: t('validation.selectProvider')
    })
  })
}

export type ProductFormData = z.infer<ReturnType<typeof createProductSchema>>

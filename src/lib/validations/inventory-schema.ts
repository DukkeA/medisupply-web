import { z } from 'zod'
import { createUuidValidator } from './index'

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>
) => string

export const createInventorySchema = (t: TranslateFn) => {
  const uuidValidator = createUuidValidator(t)

  return z.object({
    product_id: uuidValidator.refine((val) => val !== '', {
      message: t('validation.selectProduct')
    }),
    warehouse_id: uuidValidator.refine((val) => val !== '', {
      message: t('validation.selectWarehouse')
    }),
    total_quantity: z
      .number({
        message: t('validation.quantity.invalid')
      })
      .int({ message: t('validation.quantity.wholeNumber') })
      .min(0, { message: t('validation.quantity.negative') }),
    batch_number: z
      .string()
      .trim()
      .min(1, { message: t('validation.batchNumber.required') })
      .max(255, { message: t('validation.batchNumber.maxLength') })
      .transform((val) => val.toUpperCase()),
    expiration_date: z
      .string()
      .min(1, { message: t('validation.expirationDate.required') })
      .refine(
        (date) => {
          const selectedDate = new Date(date)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return selectedDate >= today
        },
        { message: t('validation.expirationDate.pastDate') }
      )
  })
}

export type InventoryFormData = z.infer<
  ReturnType<typeof createInventorySchema>
>

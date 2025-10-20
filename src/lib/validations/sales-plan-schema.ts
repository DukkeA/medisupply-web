import { z } from 'zod'
import { createUuidValidator, createMonetaryAmountValidator } from './index'

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>
) => string

export const createSalesPlanSchema = (t: TranslateFn) => {
  return z.object({
    seller_id: createUuidValidator(t).refine((val) => val !== '', {
      message: t('validation.selectVendor')
    }),
    sales_period: z
      .string()
      .regex(/^Q[1-4]-\d{4}$/, {
        message: t('validation.salesPlan.periodFormat')
      })
      .refine(
        (period) => {
          const year = parseInt(period.split('-')[1])
          return year >= 2000 && year <= 2100
        },
        { message: t('validation.salesPlan.yearRange') }
      ),
    goal: createMonetaryAmountValidator(t).refine((val) => val > 0, {
      message: t('validation.salesPlan.goalPositive')
    })
  })
}

export type SalesPlanFormData = z.infer<
  ReturnType<typeof createSalesPlanSchema>
>

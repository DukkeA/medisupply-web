import { z } from 'zod'
import {
  createNameValidator,
  createEmailValidator,
  createPhoneValidator,
  createCountryValidator,
  createCityValidator
} from './index'

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>
) => string

export const createSellerSchema = (t: TranslateFn) => {
  return z.object({
    name: createNameValidator(t, 255).refine((val) => val.length > 0, {
      message: t('validation.vendor.nameRequired')
    }),
    email: createEmailValidator(t),
    phone: createPhoneValidator(t),
    country: createCountryValidator(t),
    city: createCityValidator(t)
  })
}

export type SellerFormData = z.infer<ReturnType<typeof createSellerSchema>>

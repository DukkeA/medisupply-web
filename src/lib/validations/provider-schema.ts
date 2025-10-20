import { z } from 'zod'
import {
  createNameValidator,
  createEmailValidator,
  createPhoneValidator,
  createAddressValidator,
  createCountryValidator
} from './index'

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>
) => string

export const createProviderSchema = (t: TranslateFn) => {
  return z.object({
    name: createNameValidator(t, 255).refine((val) => val.length > 0, {
      message: t('validation.provider.nameRequired')
    }),
    contact_name: createNameValidator(t, 255).refine((val) => val.length > 0, {
      message: t('validation.provider.contactRequired')
    }),
    nit: z
      .string()
      .trim()
      .min(1, { message: t('validation.provider.nitRequired') })
      .max(50, { message: t('validation.provider.nitMaxLength') }),
    email: createEmailValidator(t),
    phone: createPhoneValidator(t),
    address: createAddressValidator(t),
    country: createCountryValidator(t)
  })
}

export type ProviderFormData = z.infer<ReturnType<typeof createProviderSchema>>

import { z } from 'zod'
import {
  createNameValidator,
  createCountryValidator,
  createCityValidator,
  createAddressValidator
} from './index'

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>
) => string

export const createWarehouseSchema = (t: TranslateFn) => {
  return z.object({
    name: createNameValidator(t, 255).refine((val) => val.length > 0, {
      message: t('validation.warehouse.nameRequired')
    }),
    country: createCountryValidator(t),
    city: createCityValidator(t),
    address: createAddressValidator(t)
  })
}

export type WarehouseFormData = z.infer<
  ReturnType<typeof createWarehouseSchema>
>

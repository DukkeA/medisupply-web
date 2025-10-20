import { z } from 'zod'

// Type for translation function
type TranslateFn = (
  key: string,
  values?: Record<string, string | number>
) => string

// Validation schema factories that accept translation function
export const createEmailValidator = (t: TranslateFn) =>
  z
    .string()
    .email({ message: t('validation.email') })
    .max(255, { message: t('validation.string.maxLength', { max: '255' }) })

export const createPhoneValidator = (t: TranslateFn) =>
  z
    .string()
    .trim()
    .min(1, { message: t('validation.phone.required') })
    .max(50, { message: t('validation.phone.maxLength') })

export const createCountryValidator = (t: TranslateFn) =>
  z
    .string()
    .min(1, { message: t('validation.country') })
    .max(100, { message: t('validation.string.maxLength', { max: '100' }) })

export const createUuidValidator = (t: TranslateFn) =>
  z.string().uuid({ message: t('validation.uuid') })

export const createPriceValidator = (t: TranslateFn) =>
  z
    .number({ message: t('validation.price.invalid') })
    .positive({ message: t('validation.price.positive') })
    .max(99999999.99, { message: t('validation.price.maxValue') })
    .multipleOf(0.01, { message: t('validation.price.decimal') })

export const createMonetaryAmountValidator = (t: TranslateFn) =>
  z
    .number({ message: t('validation.amount.invalid') })
    .positive({ message: t('validation.amount.positive') })
    .max(99999999.99, { message: t('validation.amount.maxValue') })
    .multipleOf(0.01, { message: t('validation.amount.decimal') })

export const createNameValidator = (t: TranslateFn, maxLength: number = 255) =>
  z
    .string()
    .trim()
    .min(1, { message: t('validation.name.required') })
    .max(maxLength, {
      message: t('validation.name.maxLength', { max: maxLength.toString() })
    })

export const createAddressValidator = (t: TranslateFn) =>
  z
    .string()
    .trim()
    .min(1, { message: t('validation.address.required') })
    .max(500, { message: t('validation.address.maxLength') })

export const createCityValidator = (t: TranslateFn) =>
  z
    .string()
    .trim()
    .min(1, { message: t('validation.city.required') })
    .max(100, { message: t('validation.city.maxLength') })

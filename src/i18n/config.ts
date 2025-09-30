export const defaultLocale = 'en' as const
export const locales = ['en', 'es'] as const

export type Locale = (typeof locales)[number]

export const localePrefix = 'never' as const // No locale in URL: /about (not /en/about)

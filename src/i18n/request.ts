import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import { Locale } from './config'

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  const requestedLocale = await requestLocale

  // Ensure that a valid locale is used
  const isValidLocale =
    requestedLocale && routing.locales.includes(requestedLocale as Locale)
  const locale: Locale = isValidLocale
    ? (requestedLocale as Locale)
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})

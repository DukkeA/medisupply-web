'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ReactNode, useState, useEffect } from 'react'
import { defaultLocale, locales, Locale } from '@/i18n/config'

interface IntlProviderProps {
  children: ReactNode
  initialMessages: Record<string, unknown>
}

export default function IntlProvider({
  children,
  initialMessages
}: IntlProviderProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const [messages, setMessages] = useState(initialMessages)

  useEffect(() => {
    // Get locale from localStorage or browser
    const storedLocale = localStorage.getItem('locale') as Locale
    const browserLocale = navigator.language.split('-')[0] as Locale

    const preferredLocale =
      storedLocale && locales.includes(storedLocale)
        ? storedLocale
        : locales.includes(browserLocale)
          ? browserLocale
          : defaultLocale

    if (preferredLocale !== defaultLocale) {
      setLocale(preferredLocale)
      // Dynamically load messages for the preferred locale
      import(`@/messages/${preferredLocale}.json`).then((module) => {
        setMessages(module.default)
      })
    }
  }, [])

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headersList = await headers()

  // 1. Intentar obtener el locale de la cookie
  let locale = cookieStore.get('locale')?.value

  // 2. Si no hay cookie, detectar del navegador
  if (!locale) {
    const acceptLanguage = headersList.get('accept-language')
    if (acceptLanguage) {
      // Extraer el primer idioma del header (ej: "es-ES,es;q=0.9,en;q=0.8" -> "es")
      const browserLang = acceptLanguage
        .split(',')[0]
        .split('-')[0]
        .toLowerCase()
      // Solo usar si es un idioma soportado
      locale = ['en', 'es'].includes(browserLang) ? browserLang : 'en'
    }
  }

  // 3. Fallback a inglés
  locale = locale || 'en'

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})

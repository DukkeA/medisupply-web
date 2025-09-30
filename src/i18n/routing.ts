import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'
import { locales, localePrefix } from './config'

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix
})

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)

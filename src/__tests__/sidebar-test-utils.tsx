import { ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { NextIntlClientProvider } from 'next-intl'

interface SidebarWrapperProps {
  children: ReactNode
}

const messages = {
  sidebar: {
    providers: 'Providers',
    products: 'Products',
    vendors: 'Vendors',
    'manage-vendors': 'Manage Vendors',
    'vendors-plans': 'Vendors Plans',
    reports: 'Reports',
    overview: 'Overview',
    'generate-report': 'Generate Report',
    inventory: 'Inventory',
    items: 'Items',
    warehouses: 'Warehouses',
    routes: 'Routes'
  }
}

function SidebarWrapper({ children }: SidebarWrapperProps) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <SidebarProvider>{children}</SidebarProvider>
    </NextIntlClientProvider>
  )
}

export function renderWithSidebar(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: SidebarWrapper, ...options })
}

export * from '@testing-library/react'

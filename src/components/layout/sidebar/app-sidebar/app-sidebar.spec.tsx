import { renderWithProviders } from '@/__tests__/test-utils'
import { screen } from '@testing-library/react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { describe, it, expect } from 'vitest'
import { AppSidebar } from '.'

describe('AppSidebar', () => {
  it('renders the company branding', () => {
    renderWithProviders(<AppSidebar />, {
      locale: 'en',
      additionalWrappers: [SidebarProvider],
      skipQueryClient: true
    })

    expect(screen.getByText('Medisupply')).toBeInTheDocument()
    expect(screen.getByText('Uniandes')).toBeInTheDocument()
  })

  it('renders main navigation items', () => {
    renderWithProviders(<AppSidebar />, {
      locale: 'en',
      additionalWrappers: [SidebarProvider],
      skipQueryClient: true
    })

    expect(screen.getByText('providers')).toBeInTheDocument()
    expect(screen.getByText('products')).toBeInTheDocument()
    expect(screen.getByText('vendors')).toBeInTheDocument()
    expect(screen.getByText('reports')).toBeInTheDocument()
    expect(screen.getByText('inventory')).toBeInTheDocument()
    expect(screen.getByText('routes')).toBeInTheDocument()
  })

  it('renders user navigation in footer', () => {
    renderWithProviders(<AppSidebar />, {
      locale: 'en',
      additionalWrappers: [SidebarProvider],
      skipQueryClient: true
    })

    expect(screen.getByText('shadcn')).toBeInTheDocument()
    expect(screen.getByText('m@example.com')).toBeInTheDocument()
  })

  it('applies variant and additional props correctly', () => {
    renderWithProviders(
      <AppSidebar data-testid="sidebar" className="custom-class" />,
      {
        locale: 'en',
        additionalWrappers: [SidebarProvider],
        skipQueryClient: true
      }
    )

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toHaveClass('custom-class')
  })
})

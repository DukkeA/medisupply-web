import { renderWithSidebar, screen } from '@/__tests__/sidebar-test-utils'
import { describe, it, expect } from 'vitest'
import { AppSidebar } from '.'

describe('AppSidebar', () => {
  it('renders the company branding', () => {
    renderWithSidebar(<AppSidebar />)

    expect(screen.getByText('Medisupply')).toBeInTheDocument()
    expect(screen.getByText('Uniandes')).toBeInTheDocument()
  })

  it('renders main navigation items', () => {
    renderWithSidebar(<AppSidebar />)

    expect(screen.getByText('Providers')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Vendors')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.getByText('Routes')).toBeInTheDocument()
  })

  it('renders user navigation in footer', () => {
    renderWithSidebar(<AppSidebar />)

    expect(screen.getByText('shadcn')).toBeInTheDocument()
    expect(screen.getByText('m@example.com')).toBeInTheDocument()
  })

  it('applies variant and additional props correctly', () => {
    renderWithSidebar(
      <AppSidebar data-testid="sidebar" className="custom-class" />
    )

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toHaveClass('custom-class')
  })
})

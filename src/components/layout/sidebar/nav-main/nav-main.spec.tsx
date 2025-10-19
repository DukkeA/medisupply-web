import { renderWithProviders } from '@/__tests__/test-utils'
import { screen } from '@testing-library/react'
import { SidebarProvider } from '@/components/ui/sidebar'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Bot, BookOpen } from 'lucide-react'
import { NavMain } from '.'

const mockItems = [
  {
    title: 'Products',
    url: '/products',
    icon: Bot,
    items: []
  },
  {
    title: 'Vendors',
    url: '/vendors',
    icon: BookOpen,
    isActive: true,
    items: [
      {
        title: 'Manage Vendors',
        url: '/vendors'
      },
      {
        title: 'Vendor Plans',
        url: '/vendors/plans'
      }
    ]
  }
]

const renderOptions = {
  locale: 'en' as const,
  additionalWrappers: [SidebarProvider],
  skipQueryClient: true
}

describe('NavMain', () => {
  it('renders all navigation items', () => {
    renderWithProviders(<NavMain items={mockItems} />, renderOptions)

    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Vendors')).toBeInTheDocument()
  })

  it('renders Platform group label', () => {
    renderWithProviders(<NavMain items={mockItems} />, renderOptions)

    expect(screen.getByText('Platform')).toBeInTheDocument()
  })

  it('renders submenu items for items with children', () => {
    renderWithProviders(<NavMain items={mockItems} />, renderOptions)

    expect(screen.getByText('Manage Vendors')).toBeInTheDocument()
    expect(screen.getByText('Vendor Plans')).toBeInTheDocument()
  })

  it('does not render submenu for items without children', () => {
    const itemsWithoutChildren = [mockItems[0]]
    renderWithProviders(<NavMain items={itemsWithoutChildren} />, renderOptions)

    expect(screen.queryByText('Manage Vendors')).not.toBeInTheDocument()
  })

  it('has correct links for navigation items', () => {
    renderWithProviders(<NavMain items={mockItems} />, renderOptions)

    const productsLink = screen.getByRole('link', { name: /products/i })
    const vendorsLinks = screen.getAllByRole('link', { name: /vendors/i })

    expect(productsLink).toHaveAttribute('href', '/products')
    expect(vendorsLinks[0]).toHaveAttribute('href', '/vendors') // Main vendors link
  })

  it('has correct links for submenu items', () => {
    renderWithProviders(<NavMain items={mockItems} />, renderOptions)

    const manageVendorsLink = screen.getByRole('link', {
      name: /manage vendors/i
    })
    const vendorPlansLink = screen.getByRole('link', { name: /vendor plans/i })

    expect(manageVendorsLink).toHaveAttribute('href', '/vendors')
    expect(vendorPlansLink).toHaveAttribute('href', '/vendors/plans')
  })

  it('shows toggle button for items with children', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NavMain items={mockItems} />, renderOptions)

    const toggleButton = screen.getByRole('button', { name: /toggle/i })
    expect(toggleButton).toBeInTheDocument()

    await user.click(toggleButton)
    expect(toggleButton).toHaveClass('data-[state=open]:rotate-90')
  })
})

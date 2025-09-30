import { renderWithSidebar, screen } from '@/__tests__/sidebar-test-utils'
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

describe('NavMain', () => {
  it('renders all navigation items', () => {
    renderWithSidebar(<NavMain items={mockItems} />)

    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Vendors')).toBeInTheDocument()
  })

  it('renders Platform group label', () => {
    renderWithSidebar(<NavMain items={mockItems} />)

    expect(screen.getByText('Platform')).toBeInTheDocument()
  })

  it('renders submenu items for items with children', () => {
    renderWithSidebar(<NavMain items={mockItems} />)

    expect(screen.getByText('Manage Vendors')).toBeInTheDocument()
    expect(screen.getByText('Vendor Plans')).toBeInTheDocument()
  })

  it('does not render submenu for items without children', () => {
    const itemsWithoutChildren = [mockItems[0]]
    renderWithSidebar(<NavMain items={itemsWithoutChildren} />)

    expect(screen.queryByText('Manage Vendors')).not.toBeInTheDocument()
  })

  it('has correct links for navigation items', () => {
    renderWithSidebar(<NavMain items={mockItems} />)

    const productsLink = screen.getByRole('link', { name: /products/i })
    const vendorsLinks = screen.getAllByRole('link', { name: /vendors/i })

    expect(productsLink).toHaveAttribute('href', '/products')
    expect(vendorsLinks[0]).toHaveAttribute('href', '/vendors') // Main vendors link
  })

  it('has correct links for submenu items', () => {
    renderWithSidebar(<NavMain items={mockItems} />)

    const manageVendorsLink = screen.getByRole('link', {
      name: /manage vendors/i
    })
    const vendorPlansLink = screen.getByRole('link', { name: /vendor plans/i })

    expect(manageVendorsLink).toHaveAttribute('href', '/vendors')
    expect(vendorPlansLink).toHaveAttribute('href', '/vendors/plans')
  })

  it('shows toggle button for items with children', async () => {
    const user = userEvent.setup()
    renderWithSidebar(<NavMain items={mockItems} />)

    const toggleButton = screen.getByRole('button', { name: /toggle/i })
    expect(toggleButton).toBeInTheDocument()

    await user.click(toggleButton)
    expect(toggleButton).toHaveClass('data-[state=open]:rotate-90')
  })
})

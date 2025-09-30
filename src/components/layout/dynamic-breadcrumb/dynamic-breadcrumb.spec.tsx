import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DynamicBreadcrumb } from '.'

// Mock Next.js navigation
const mockUsePathname = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname()
}))

// Mock the route config functions
vi.mock('@/lib/route-config', () => ({
  getRouteLabel: vi.fn((path: string) => {
    const labels: Record<string, string> = {
      '/': 'Home',
      '/vendors': 'Vendors',
      '/vendors/plans': 'Vendor Plans',
      '/products': 'Products',
      '/inventory': 'Inventory',
      '/inventory/warehouses': 'Warehouses'
    }
    return labels[path] || path.replace('/', '').replace('-', ' ')
  }),
  shouldShowInBreadcrumb: vi.fn((path: string) => {
    // Mock logic: show all paths except some special ones
    return !path.includes('admin') && !path.includes('hidden')
  })
}))

describe('DynamicBreadcrumb', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns null for root path', () => {
    mockUsePathname.mockReturnValue('/')
    const { container } = render(<DynamicBreadcrumb />)
    expect(container.firstChild).toBeNull()
  })

  it('renders breadcrumb for single level path', () => {
    mockUsePathname.mockReturnValue('/vendors')
    render(<DynamicBreadcrumb />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Vendors')).toBeInTheDocument()
  })

  it('renders breadcrumb for nested path', () => {
    mockUsePathname.mockReturnValue('/vendors/plans')
    render(<DynamicBreadcrumb />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Vendors')).toBeInTheDocument()
    expect(screen.getByText('Vendor Plans')).toBeInTheDocument()
  })

  it('renders correct links for intermediate segments', () => {
    mockUsePathname.mockReturnValue('/vendors/plans')
    render(<DynamicBreadcrumb />)

    const homeLink = screen.getByRole('link', { name: 'Home' })
    const vendorsLink = screen.getByRole('link', { name: 'Vendors' })

    expect(homeLink).toHaveAttribute('href', '/')
    expect(vendorsLink).toHaveAttribute('href', '/vendors')
  })

  it('renders last segment as page (not link)', () => {
    mockUsePathname.mockReturnValue('/vendors/plans')
    render(<DynamicBreadcrumb />)

    // Last segment should be present as text but not as a clickable link
    expect(screen.getByText('Vendor Plans')).toBeInTheDocument()

    // Check that the last segment doesn't have href attribute (not a navigation link)
    const vendorPlansElement = screen.getByText('Vendor Plans').closest('span')
    expect(vendorPlansElement).toHaveAttribute('aria-current', 'page')
  })

  it('handles deep nested paths', () => {
    mockUsePathname.mockReturnValue('/inventory/warehouses')
    render(<DynamicBreadcrumb />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.getByText('Warehouses')).toBeInTheDocument()

    // Check links
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    )
    expect(screen.getByRole('link', { name: 'Inventory' })).toHaveAttribute(
      'href',
      '/inventory'
    )
  })

  it('renders separators between breadcrumb items', () => {
    mockUsePathname.mockReturnValue('/vendors/plans')
    const { container } = render(<DynamicBreadcrumb />)

    // Check that separators are present by looking for the separator component
    const separators = container.querySelectorAll(
      '[data-slot="breadcrumb-separator"]'
    )
    expect(separators.length).toBeGreaterThan(0)
  })

  it('applies responsive classes for mobile hiding', () => {
    mockUsePathname.mockReturnValue('/vendors/plans')
    const { container } = render(<DynamicBreadcrumb />)

    // Check that hidden md:block classes are applied for responsive behavior
    const hiddenElements = container.querySelectorAll('.hidden.md\\:block')
    expect(hiddenElements.length).toBeGreaterThan(0)
  })

  it('handles empty segments correctly', () => {
    mockUsePathname.mockReturnValue('/vendors//plans')
    render(<DynamicBreadcrumb />)

    // Should still work correctly despite double slash
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Vendors')).toBeInTheDocument()
    expect(screen.getByText('Vendor Plans')).toBeInTheDocument()
  })
})

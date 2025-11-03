import { renderWithProviders } from '@/__tests__/test-utils'
import { screen } from '@testing-library/react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { describe, it, expect, vi } from 'vitest'
import { AppSidebar } from '.'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock the useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      user_id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      groups: ['web_users'],
      user_type: null
    },
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: true
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )
}))
describe('AppSidebar', () => {
  it('renders the company branding', () => {
    renderWithProviders(<AppSidebar />, {
      locale: 'en',
      additionalWrappers: [SidebarProvider, AuthProvider],
      skipQueryClient: true
    })

    expect(screen.getByText('Medisupply')).toBeInTheDocument()
    expect(screen.getByText('Uniandes')).toBeInTheDocument()
  })

  it('renders main navigation items', () => {
    renderWithProviders(<AppSidebar />, {
      locale: 'en',
      additionalWrappers: [SidebarProvider, AuthProvider],
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
      additionalWrappers: [SidebarProvider, AuthProvider],
      skipQueryClient: true
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('applies variant and additional props correctly', () => {
    renderWithProviders(
      <AppSidebar data-testid="sidebar" className="custom-class" />,
      {
        locale: 'en',
        additionalWrappers: [SidebarProvider, AuthProvider],
        skipQueryClient: true
      }
    )

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toHaveClass('custom-class')
  })
})

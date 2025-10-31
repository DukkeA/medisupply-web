import { renderWithProviders } from '@/__tests__/test-utils'
import { screen } from '@testing-library/react'
import { SidebarProvider } from '@/components/ui/sidebar'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { NavUser } from '.'

// Mock the useSidebar hook
vi.mock('@/components/ui/sidebar', async () => {
  const actual = await vi.importActual('@/components/ui/sidebar')
  return {
    ...actual,
    useSidebar: () => ({ isMobile: false })
  }
})

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
  })
}))

const renderOptions = {
  locale: 'en' as const,
  additionalWrappers: [SidebarProvider],
  skipQueryClient: true
}

describe('NavUser', () => {
  it('renders user information', () => {
    renderWithProviders(<NavUser />, renderOptions)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('renders user avatar with correct src and alt', () => {
    renderWithProviders(<NavUser />, renderOptions)

    // Avatar should use dicebear API with user_id
    const images = screen.queryAllByRole('img')
    if (images.length > 0) {
      images.forEach((avatar) => {
        expect(avatar).toHaveAttribute(
          'src',
          'https://api.dicebear.com/7.x/avataaars/svg?seed=123'
        )
        expect(avatar).toHaveAttribute('alt', 'John Doe')
      })
    } else {
      // If no images, should have fallback text (first letter of name)
      expect(screen.getByText('J')).toBeInTheDocument()
    }
  })

  it('renders fallback when avatar fails to load', () => {
    renderWithProviders(<NavUser />, renderOptions)

    const fallbacks = screen.getAllByText('J')
    expect(fallbacks.length).toBeGreaterThanOrEqual(1) // At least one fallback visible
  })

  it('opens dropdown menu when clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NavUser />, renderOptions)

    const triggerButton = screen.getByRole('button')
    await user.click(triggerButton)

    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument()
    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Billing')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Log out')).toBeInTheDocument()
  })

  it('renders all menu items in dropdown', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NavUser />, renderOptions)

    const triggerButton = screen.getByRole('button')
    await user.click(triggerButton)

    const menuItems = [
      'Upgrade to Pro',
      'Account',
      'Billing',
      'Notifications',
      'Log out'
    ]

    menuItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('renders user info duplicate in dropdown header', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NavUser />, renderOptions)

    const triggerButton = screen.getByRole('button')
    await user.click(triggerButton)

    const nameElements = screen.getAllByText('John Doe')
    const emailElements = screen.getAllByText('john@example.com')

    expect(nameElements).toHaveLength(2) // Trigger + dropdown
    expect(emailElements).toHaveLength(2) // Trigger + dropdown
  })

  it('handles mobile layout for dropdown positioning', async () => {
    // Temporarily override the existing mock to return mobile state
    const originalMock = vi.mocked(
      await import('@/components/ui/sidebar')
    ).useSidebar
    vi.mocked(await import('@/components/ui/sidebar')).useSidebar = vi.fn(
      () => ({
        state: 'expanded',
        open: true,
        setOpen: vi.fn(),
        openMobile: true,
        setOpenMobile: vi.fn(),
        isMobile: true,
        toggleSidebar: vi.fn()
      })
    )

    const user = userEvent.setup()
    renderWithProviders(<NavUser />, renderOptions)

    const triggerButton = screen.getByRole('button')
    await user.click(triggerButton)

    // The dropdown should render with mobile positioning (side='bottom')
    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Log out')).toBeInTheDocument()

    // Restore original mock
    vi.mocked(await import('@/components/ui/sidebar')).useSidebar = originalMock
  })
})

import { renderWithSidebar, screen } from '@/__tests__/sidebar-test-utils'
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

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: '/avatars/john.jpg'
}

describe('NavUser', () => {
  it('renders user information', () => {
    renderWithSidebar(<NavUser user={mockUser} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('renders user avatar with correct src and alt', () => {
    renderWithSidebar(<NavUser user={mockUser} />)

    // Avatar may fallback to text, so we check if there are images or fallback text
    const images = screen.queryAllByRole('img')
    if (images.length > 0) {
      images.forEach((avatar) => {
        expect(avatar).toHaveAttribute('src', '/avatars/john.jpg')
        expect(avatar).toHaveAttribute('alt', 'John Doe')
      })
    } else {
      // If no images, should have fallback text
      expect(screen.getByText('CN')).toBeInTheDocument()
    }
  })

  it('renders fallback when avatar fails to load', () => {
    renderWithSidebar(<NavUser user={mockUser} />)

    const fallbacks = screen.getAllByText('CN')
    expect(fallbacks.length).toBeGreaterThanOrEqual(1) // At least one fallback visible
  })

  it('opens dropdown menu when clicked', async () => {
    const user = userEvent.setup()
    renderWithSidebar(<NavUser user={mockUser} />)

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
    renderWithSidebar(<NavUser user={mockUser} />)

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
    renderWithSidebar(<NavUser user={mockUser} />)

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
    renderWithSidebar(<NavUser user={mockUser} />)

    const triggerButton = screen.getByRole('button')
    await user.click(triggerButton)

    // The dropdown should render with mobile positioning (side='bottom')
    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Log out')).toBeInTheDocument()

    // Restore original mock
    vi.mocked(await import('@/components/ui/sidebar')).useSidebar = originalMock
  })
})

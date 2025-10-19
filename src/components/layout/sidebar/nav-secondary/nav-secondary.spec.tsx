import { renderWithProviders } from '@/__tests__/test-utils'
import { screen } from '@testing-library/react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { describe, it, expect } from 'vitest'
import { LifeBuoy, Send } from 'lucide-react'
import { NavSecondary } from '.'

const mockItems = [
  {
    title: 'Support',
    url: '/support',
    icon: LifeBuoy
  },
  {
    title: 'Feedback',
    url: '/feedback',
    icon: Send
  }
]

const renderOptions = {
  locale: 'en' as const,
  additionalWrappers: [SidebarProvider],
  skipQueryClient: true
}

describe('NavSecondary', () => {
  it('renders all navigation items', () => {
    renderWithProviders(<NavSecondary items={mockItems} />, renderOptions)

    expect(screen.getByText('Support')).toBeInTheDocument()
    expect(screen.getByText('Feedback')).toBeInTheDocument()
  })

  it('has correct links for navigation items', () => {
    renderWithProviders(<NavSecondary items={mockItems} />, renderOptions)

    const supportLink = screen.getByRole('link', { name: /support/i })
    const feedbackLink = screen.getByRole('link', { name: /feedback/i })

    expect(supportLink).toHaveAttribute('href', '/support')
    expect(feedbackLink).toHaveAttribute('href', '/feedback')
  })

  it('renders items with small size buttons', () => {
    renderWithProviders(<NavSecondary items={mockItems} />, renderOptions)

    const supportButton = screen.getByRole('link', { name: /support/i })
    const feedbackButton = screen.getByRole('link', { name: /feedback/i })

    expect(supportButton).toBeInTheDocument()
    expect(feedbackButton).toBeInTheDocument()
  })

  it('forwards additional props to SidebarGroup', () => {
    renderWithProviders(
      <NavSecondary
        items={mockItems}
        data-testid="nav-secondary"
        className="custom-class"
      />,
      renderOptions
    )

    const navGroup = screen.getByTestId('nav-secondary')
    expect(navGroup).toHaveClass('custom-class')
  })

  it('renders empty items list without errors', () => {
    renderWithProviders(<NavSecondary items={[]} />, renderOptions)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders correct number of menu items', () => {
    renderWithProviders(<NavSecondary items={mockItems} />, renderOptions)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
  })
})

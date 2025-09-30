import { renderWithSidebar, screen } from '@/__tests__/sidebar-test-utils'
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

describe('NavSecondary', () => {
  it('renders all navigation items', () => {
    renderWithSidebar(<NavSecondary items={mockItems} />)

    expect(screen.getByText('Support')).toBeInTheDocument()
    expect(screen.getByText('Feedback')).toBeInTheDocument()
  })

  it('has correct links for navigation items', () => {
    renderWithSidebar(<NavSecondary items={mockItems} />)

    const supportLink = screen.getByRole('link', { name: /support/i })
    const feedbackLink = screen.getByRole('link', { name: /feedback/i })

    expect(supportLink).toHaveAttribute('href', '/support')
    expect(feedbackLink).toHaveAttribute('href', '/feedback')
  })

  it('renders items with small size buttons', () => {
    renderWithSidebar(<NavSecondary items={mockItems} />)

    const supportButton = screen.getByRole('link', { name: /support/i })
    const feedbackButton = screen.getByRole('link', { name: /feedback/i })

    expect(supportButton).toBeInTheDocument()
    expect(feedbackButton).toBeInTheDocument()
  })

  it('forwards additional props to SidebarGroup', () => {
    renderWithSidebar(
      <NavSecondary
        items={mockItems}
        data-testid="nav-secondary"
        className="custom-class"
      />
    )

    const navGroup = screen.getByTestId('nav-secondary')
    expect(navGroup).toHaveClass('custom-class')
  })

  it('renders empty items list without errors', () => {
    renderWithSidebar(<NavSecondary items={[]} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders correct number of menu items', () => {
    renderWithSidebar(<NavSecondary items={mockItems} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
  })
})

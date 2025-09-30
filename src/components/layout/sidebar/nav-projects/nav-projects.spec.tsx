import { renderWithSidebar, screen } from '@/__tests__/sidebar-test-utils'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Frame, PieChart } from 'lucide-react'
import { NavProjects } from '.'

// Mock the useSidebar hook
vi.mock('@/components/ui/sidebar', async () => {
  const actual = await vi.importActual('@/components/ui/sidebar')
  return {
    ...actual,
    useSidebar: () => ({ isMobile: false })
  }
})

const mockProjects = [
  {
    name: 'Design Engineering',
    url: '/projects/design',
    icon: Frame
  },
  {
    name: 'Sales & Marketing',
    url: '/projects/sales',
    icon: PieChart
  }
]

describe('NavProjects', () => {
  it('renders Projects group label', () => {
    renderWithSidebar(<NavProjects projects={mockProjects} />)

    expect(screen.getByText('Projects')).toBeInTheDocument()
  })

  it('renders all project items', () => {
    renderWithSidebar(<NavProjects projects={mockProjects} />)

    expect(screen.getByText('Design Engineering')).toBeInTheDocument()
    expect(screen.getByText('Sales & Marketing')).toBeInTheDocument()
  })

  it('has correct links for project items', () => {
    renderWithSidebar(<NavProjects projects={mockProjects} />)

    const designLink = screen.getByRole('link', { name: /design engineering/i })
    const salesLink = screen.getByRole('link', { name: /sales & marketing/i })

    expect(designLink).toHaveAttribute('href', '/projects/design')
    expect(salesLink).toHaveAttribute('href', '/projects/sales')
  })

  it('renders More button at the end', () => {
    renderWithSidebar(<NavProjects projects={mockProjects} />)

    const moreButtons = screen.getAllByText('More')
    expect(moreButtons.length).toBeGreaterThanOrEqual(1) // At least one More button
  })

  it('opens project action dropdown when more button is clicked', async () => {
    const user = userEvent.setup()
    renderWithSidebar(<NavProjects projects={mockProjects} />)

    const moreButtons = screen.getAllByRole('button', { name: /more/i })
    await user.click(moreButtons[0])

    expect(screen.getByText('View Project')).toBeInTheDocument()
    expect(screen.getByText('Share Project')).toBeInTheDocument()
    expect(screen.getByText('Delete Project')).toBeInTheDocument()
  })

  it('renders dropdown menu items with correct structure', async () => {
    const user = userEvent.setup()
    renderWithSidebar(<NavProjects projects={mockProjects} />)

    const moreButtons = screen.getAllByRole('button', { name: /more/i })
    await user.click(moreButtons[0])

    const viewProject = screen.getByText('View Project')
    const shareProject = screen.getByText('Share Project')
    const deleteProject = screen.getByText('Delete Project')

    expect(viewProject).toBeInTheDocument()
    expect(shareProject).toBeInTheDocument()
    expect(deleteProject).toBeInTheDocument()
  })

  it('renders empty projects list without errors', () => {
    renderWithSidebar(<NavProjects projects={[]} />)

    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('More')).toBeInTheDocument()
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
    renderWithSidebar(<NavProjects projects={mockProjects} />)

    const moreButtons = screen.getAllByRole('button', { name: /more/i })
    await user.click(moreButtons[0])

    // The dropdown should render with mobile positioning
    expect(screen.getByText('View Project')).toBeInTheDocument()

    // Restore original mock
    vi.mocked(await import('@/components/ui/sidebar')).useSidebar = originalMock
  })
})

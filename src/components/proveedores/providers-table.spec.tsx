import React from 'react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProvidersTable } from './providers-table'

/* ───────────── Mocks tipados ───────────── */

// Modal: exponer estado de apertura
vi.mock('@/components/proveedores/create-provider-modal', () => ({
  CreateProviderModal: ({ open }: { open: boolean }) => (
    <div
      data-testid="create-provider-modal"
      data-open={open ? 'true' : 'false'}
    />
  )
}))

// Mock useProviders hook
type UseQueryResult<T> = { data?: T; isLoading: boolean; isError: boolean }
const mockUseProviders = vi.fn<() => UseQueryResult<unknown>>()

vi.mock('@/services/hooks/use-providers', () => ({
  useProviders: () => mockUseProviders()
}))

/* ───────────── Tests ───────────── */

const origEnv = process.env

beforeEach(() => {
  vi.clearAllMocks()
  process.env = { ...origEnv }
})

afterEach(() => {
  process.env = origEnv
})

/* ───────────── Tests ───────────── */

describe('ProvidersTable', () => {
  it('should display loading state while fetching data', () => {
    mockUseProviders.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined
    })
    render(<ProvidersTable />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display error message when query fails', () => {
    mockUseProviders.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined
    })
    render(<ProvidersTable />)
    expect(screen.getByText('Error loading providers.')).toBeInTheDocument()
  })

  it('should render table with empty state when data is empty', () => {
    mockUseProviders.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        has_next: false,
        has_previous: false
      }
    })
    render(<ProvidersTable />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('table.noData')).toBeInTheDocument()
  })

  it('should render rows and open modal when add button is clicked', async () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = 'true'

    mockUseProviders.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [
          {
            id: '1',
            name: 'Alice',
            contact_name: 'Acme',
            nit: 'N1',
            email: 'a@x.com',
            phone: '111',
            address: 'Street 1',
            country: 'CO',
            created_at: '2025-01-01',
            updated_at: '2025-01-01'
          }
        ],
        total: 1,
        page: 1,
        size: 10,
        has_next: false,
        has_previous: false
      }
    })

    render(<ProvidersTable />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('N1')).toBeInTheDocument()
    expect(screen.getByText('a@x.com')).toBeInTheDocument()

    const addBtn = screen.getByRole('button')
    expect(screen.getByTestId('create-provider-modal')).toHaveAttribute(
      'data-open',
      'false'
    )

    const user = userEvent.setup()
    await user.click(addBtn)

    expect(screen.getByTestId('create-provider-modal')).toHaveAttribute(
      'data-open',
      'true'
    )
  })
})

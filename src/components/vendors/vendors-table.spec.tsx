import React, { PropsWithChildren } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VendorsTable } from './vendors-table'

/* ────────── Mocks tipados ────────── */

// Modal: exponer estado de apertura
vi.mock('@/components/vendors/create-vendor-modal', () => ({
  CreateVendorModal: ({ open }: { open: boolean }) => (
    <div
      data-testid="create-vendor-modal"
      data-open={open ? 'true' : 'false'}
    />
  )
}))

// Mock useSellers hook
type UseQueryResult<T> = { data?: T; isLoading: boolean; isError: boolean }
const mockUseSellers = vi.fn<() => UseQueryResult<unknown>>()

vi.mock('@/services/hooks/use-sellers', () => ({
  useSellers: () => mockUseSellers()
}))

/* ────────── Tests ────────── */

describe('VendorsTable', () => {
  const origEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...origEnv }
  })

  afterEach(() => {
    process.env = origEnv
  })

  it('should display loading state while fetching data', () => {
    mockUseSellers.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined
    })
    render(<VendorsTable />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display error message when query fails', () => {
    mockUseSellers.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined
    })
    render(<VendorsTable />)
    expect(screen.getByText('Error loading vendors.')).toBeInTheDocument()
  })

  it('should render table with empty state when data is empty', () => {
    mockUseSellers.mockReturnValue({
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
    render(<VendorsTable />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('table.noData')).toBeInTheDocument()
  })

  it('should render rows and open modal when add button is clicked', async () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = 'true'

    mockUseSellers.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [
          {
            id: 'v1',
            name: 'Alice',
            email: 'alice@x.com',
            phone: '111',
            country: 'CO',
            city: 'Bogota',
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

    render(<VendorsTable />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('alice@x.com')).toBeInTheDocument()
    expect(screen.getByText('111')).toBeInTheDocument()
    expect(screen.getByText('CO')).toBeInTheDocument()
    expect(screen.getByText('Bogota')).toBeInTheDocument()

    const addBtn = screen.getByRole('button')
    expect(screen.getByTestId('create-vendor-modal')).toHaveAttribute(
      'data-open',
      'false'
    )

    const user = userEvent.setup()
    await user.click(addBtn)

    expect(screen.getByTestId('create-vendor-modal')).toHaveAttribute(
      'data-open',
      'true'
    )
  })
})

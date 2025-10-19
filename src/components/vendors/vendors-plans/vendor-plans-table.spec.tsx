import React, { PropsWithChildren } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VendorPlansTable } from './vendor-plans-table'

/* ────────── Mocks tipados ────────── */

// Modal: exponer estado de apertura
vi.mock('./create-vendor-plan-modal', () => ({
  CreateVendorPlanModal: ({ open }: { open: boolean }) => (
    <div
      data-testid="create-vendor-plan-modal"
      data-open={open ? 'true' : 'false'}
    />
  )
}))

// Mock useSalesPlans hook
type UseQueryResult<T> = { data?: T; isLoading: boolean; isError: boolean }
const mockUseSalesPlans = vi.fn<() => UseQueryResult<unknown>>()

vi.mock('@/services/hooks/use-sales-plans', () => ({
  useSalesPlans: () => mockUseSalesPlans()
}))

/* ────────── Tests ────────── */

describe('VendorPlansTable', () => {
  const origEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...origEnv }
  })

  it('should display loading state while fetching data', () => {
    mockUseSalesPlans.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined
    })

    render(<VendorPlansTable />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display error message when query fails', () => {
    mockUseSalesPlans.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined
    })

    render(<VendorPlansTable />)
    expect(screen.getByText('Error loading vendor plans.')).toBeInTheDocument()
  })

  it('should render table with empty state when vendor plans is empty', () => {
    mockUseSalesPlans.mockReturnValue({
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

    render(<VendorPlansTable />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('noResults')).toBeInTheDocument()
  })

  it('should render rows with formatted data and open modal when add button is clicked', async () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = 'true'

    mockUseSalesPlans.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [
          {
            id: '1',
            seller: {
              id: '10',
              name: 'Vendor X',
              email: 'vendor@test.com',
              phone: '123-456-7890',
              city: 'New York',
              country: 'USA',
              created_at: '2025-01-01',
              updated_at: '2025-01-01'
            },
            sales_period: '2025-Q1',
            goal: '100000',
            accumulate: '120000',
            status: 'On Track',
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

    render(<VendorPlansTable />)

    // tabla
    expect(screen.getByRole('table')).toBeInTheDocument()

    // vendor name from seller object
    expect(screen.getByText('Vendor X')).toBeInTheDocument()

    // period
    expect(screen.getByText('2025-Q1')).toBeInTheDocument()

    // moneda (en-US, USD) → $100,000.00 y $120,000.00
    expect(screen.getByText('$100,000.00')).toBeInTheDocument()
    expect(screen.getByText('$120,000.00')).toBeInTheDocument()

    // status
    const statusCell = screen.getByText('On Track')
    expect(statusCell).toBeInTheDocument()

    // modal: inicia cerrado y se abre al click
    const addBtn = screen.getByRole('button')
    expect(screen.getByTestId('create-vendor-plan-modal')).toHaveAttribute(
      'data-open',
      'false'
    )
    const user = userEvent.setup()
    await user.click(addBtn)
    expect(screen.getByTestId('create-vendor-plan-modal')).toHaveAttribute(
      'data-open',
      'true'
    )
  })
})

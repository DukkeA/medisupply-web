import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WarehousesTable } from './warehouses-table'

// ── Mocks tipados ──

// Modal con tipo explícito
interface MockModalProps {
  open: boolean
}
vi.mock('./create-warehouse-modal', () => ({
  CreateWarehouseModal: ({ open }: MockModalProps) => (
    <div
      data-testid="create-warehouse-modal"
      data-open={open ? 'true' : 'false'}
    />
  )
}))

// Mock useWarehouses hook
type UseQueryResult<T> = {
  data?: T
  isLoading: boolean
  isError: boolean
}

const mockUseWarehouses = vi.fn<() => UseQueryResult<unknown>>()

vi.mock('@/services/hooks/use-warehouses', () => ({
  useWarehouses: () => mockUseWarehouses()
}))

// ── Tests ──
describe('WarehousesTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state while fetching data', () => {
    mockUseWarehouses.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined
    })
    render(<WarehousesTable />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display error message when query fails', () => {
    mockUseWarehouses.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined
    })
    render(<WarehousesTable />)
    expect(screen.getByText('Error loading warehouses.')).toBeInTheDocument()
  })

  it('should render table with empty state when data is empty', () => {
    mockUseWarehouses.mockReturnValue({
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
    render(<WarehousesTable />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('table.noData')).toBeInTheDocument()
  })

  it('should render rows and open modal when add button is clicked', async () => {
    const user = userEvent.setup()
    process.env.NEXT_PUBLIC_MOCK_DATA = 'true'

    mockUseWarehouses.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [
          {
            id: '1',
            name: 'Main WH',
            address: '123 St',
            country: 'CO',
            city: 'Bogotá',
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

    render(<WarehousesTable />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Main WH')).toBeInTheDocument()
    expect(screen.getByText('Bogotá')).toBeInTheDocument()
    expect(screen.getByText('CO')).toBeInTheDocument()
    expect(screen.getByText('123 St')).toBeInTheDocument()

    const addBtn = screen.getByRole('button')
    expect(screen.getByTestId('create-warehouse-modal')).toHaveAttribute(
      'data-open',
      'false'
    )

    await user.click(addBtn)
    expect(screen.getByTestId('create-warehouse-modal')).toHaveAttribute(
      'data-open',
      'true'
    )
  })
})

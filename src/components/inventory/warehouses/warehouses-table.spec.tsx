import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/test-utils'
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

// Mock useGetWarehousesBffWebWarehousesGet hook
type UseQueryResult<T> = {
  data?: T
  isLoading: boolean
  isError: boolean
}

const mockUseGetWarehouses = vi.fn<() => UseQueryResult<unknown>>()

vi.mock('@/generated', async () => {
  const actual = await vi.importActual('@/generated')
  return {
    ...actual,
    useGetWarehousesBffWebWarehousesGet: () => mockUseGetWarehouses()
  }
})

// ── Tests ──
describe('WarehousesTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state while fetching data', () => {
    mockUseGetWarehouses.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined
    })
    renderWithProviders(<WarehousesTable />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display error message when query fails', () => {
    mockUseGetWarehouses.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined
    })
    renderWithProviders(<WarehousesTable />)
    expect(screen.getByText('Error loading warehouses.')).toBeInTheDocument()
  })

  it('should render table with empty state when data is empty', () => {
    mockUseGetWarehouses.mockReturnValue({
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
    renderWithProviders(<WarehousesTable />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('table.noData')).toBeInTheDocument()
  })

  it('should render rows and open modal when add button is clicked', async () => {
    const user = userEvent.setup()
    process.env.NEXT_PUBLIC_MOCK_DATA = 'true'

    mockUseGetWarehouses.mockReturnValue({
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

    renderWithProviders(<WarehousesTable />)

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

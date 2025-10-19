// WARNING: This file is testing the wrong component (WarehousesTable instead of CreateWarehouseModal)
// TODO: Fix this test to actually test CreateWarehouseModal component
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WarehousesTable } from './warehouses-table'

/* ─────────── Mocks tipados ─────────── */

// Mock del modal correcto: CreateWarehouseModal (NO add-to-inventory)
vi.mock('./create-warehouse-modal', () => ({
  CreateWarehouseModal: ({ open }: { open: boolean }) => (
    <div
      data-testid="create-warehouse-modal"
      data-open={open ? 'true' : 'false'}
    />
  )
}))

/* ─────────── Mock useWarehouses hook ─────────── */
type UseWarehousesResult = {
  data?: { items: unknown[] }
  isLoading: boolean
  isError: boolean
}
const mockUseWarehouses = vi.fn<() => UseWarehousesResult>()

vi.mock('@/services/hooks/use-warehouses', () => ({
  useWarehouses: () => mockUseWarehouses()
}))

/* ─────────── Tests ─────────── */
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
      data: { items: [] }
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
            id: 1,
            name: 'Main WH',
            address: '123 St',
            country: 'CO',
            city: 'Bogotá'
          }
        ]
      }
    })

    render(<WarehousesTable />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Main WH')).toBeInTheDocument()
    expect(screen.getByText('Bogotá')).toBeInTheDocument()
    expect(screen.getByText('CO')).toBeInTheDocument()
    expect(screen.getByText('123 St')).toBeInTheDocument()

    // Botón "Agregar" (único button en el header)
    const addBtn = screen.getByRole('button')
    // El modal mockeado empieza cerrado
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

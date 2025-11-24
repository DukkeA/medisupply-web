import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/test-utils'
import { InventoryTable } from './invetory-table'

/* ────────────── Mocks tipados (sin any) ────────────── */

// Modal: hacemos visible `open`
interface MockAddModalProps {
  open: boolean
}
vi.mock('./add-to-inventory-modal', () => ({
  AddToInventoryModal: ({ open }: MockAddModalProps) => (
    <div data-testid="add-modal" data-open={open ? 'true' : 'false'} />
  )
}))

// Mock Orval hooks
type UseQueryResult<T> = { data?: T; isLoading: boolean; isError: boolean }
const mockUseGetInventories = vi.fn<() => UseQueryResult<unknown>>()
const mockUseGetProducts = vi.fn<() => UseQueryResult<unknown>>()
const mockUseGetWarehouses = vi.fn<() => UseQueryResult<unknown>>()

vi.mock('@/generated', async () => {
  const actual = await vi.importActual('@/generated')
  return {
    ...actual,
    useGetInventoriesBffWebInventoriesGet: () => mockUseGetInventories(),
    useGetProductsBffWebProductsGet: () => mockUseGetProducts(),
    useGetWarehousesBffWebWarehousesGet: () => mockUseGetWarehouses()
  }
})

/* ────────────── Tests ────────────── */

describe('InventoryTable', () => {
  const origEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...origEnv }

    // Default mock values for products and warehouses
    mockUseGetProducts.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [
          {
            sku: 'SKU-001',
            name: 'Product 1',
            description: 'Test product',
            price: 10.99
          }
        ],
        total: 1,
        page: 1,
        size: 10,
        has_next: false,
        has_previous: false
      }
    })

    mockUseGetWarehouses.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [
          {
            id: 'WH-1',
            name: 'Main Warehouse',
            address: 'Test Address',
            city: 'New York'
          }
        ],
        total: 1,
        page: 1,
        size: 10,
        has_next: false,
        has_previous: false
      }
    })
  })

  afterEach(() => {
    process.env = origEnv
  })

  it('should display loading state while fetching data', () => {
    mockUseGetInventories.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined
    })
    renderWithProviders(<InventoryTable />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display error message when query fails', () => {
    mockUseGetInventories.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined
    })
    renderWithProviders(<InventoryTable />)
    expect(screen.getByText('Error loading inventory.')).toBeInTheDocument()
  })

  it('should render table with empty state when data is empty', () => {
    mockUseGetInventories.mockReturnValue({
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
    renderWithProviders(<InventoryTable />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('table.noData')).toBeInTheDocument()
  })

  it('should render rows and open modal when add button is clicked', async () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = 'true'

    mockUseGetInventories.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [
          {
            id: '1',
            product_id: 'P-001',
            warehouse_id: 'WH-10',
            total_quantity: 100,
            reserved_quantity: 5,
            batch_number: 'L-77',
            expiration_date: '2026-01-01',
            product_sku: 'SKU-001',
            product_name: 'Product 1',
            product_price: 10.99,
            warehouse_name: 'Main Warehouse',
            warehouse_city: 'New York',
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

    renderWithProviders(<InventoryTable />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('SKU-001')).toBeInTheDocument()
    expect(screen.getByText('Product 1')).toBeInTheDocument()
    // Find "Main Warehouse" in table cell specifically
    expect(
      screen.getByRole('cell', { name: 'Main Warehouse' })
    ).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('L-77')).toBeInTheDocument()
    expect(screen.getByText('2026-01-01')).toBeInTheDocument()

    const user = userEvent.setup()
    const addBtn = screen.getByRole('button', { name: /table\.addButton/i })
    expect(screen.getByTestId('add-modal')).toHaveAttribute(
      'data-open',
      'false'
    )

    await user.click(addBtn)
    expect(screen.getByTestId('add-modal')).toHaveAttribute('data-open', 'true')
  })
})

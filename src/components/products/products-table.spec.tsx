import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/test-utils'
import { ProductsTable } from './products-table'

// Mock the Orval hooks
const mockUseGetProducts = vi.fn()
const mockUseCreateProduct = vi.fn(() => ({
  mutate: vi.fn(),
  isPending: false
}))
const mockUseUploadProductsCSV = vi.fn(() => ({
  mutate: vi.fn(),
  isPending: false
}))

vi.mock('@/generated', async () => {
  const actual = await vi.importActual('@/generated')
  return {
    ...actual,
    useGetProductsBffWebProductsGet: () => mockUseGetProducts(),
    useCreateProductBffWebProductsPost: () => mockUseCreateProduct(),
    useCreateProductsFromCsvBffWebProductsBatchPost: () =>
      mockUseUploadProductsCSV()
  }
})

describe('ProductsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render products table', async () => {
    mockUseGetProducts.mockReturnValue({
      data: {
        items: [
          {
            id: '1',
            sku: 'TEST-001',
            name: 'Test Product',
            category: 'Test Category',
            price: '100.00',
            provider_id: 'provider-1',
            created_at: '2025-01-01',
            updated_at: '2025-01-01'
          }
        ],
        total: 1,
        page: 1,
        size: 10,
        has_next: false,
        has_previous: false
      },
      isLoading: false,
      isError: false
    })

    renderWithProviders(<ProductsTable />)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Check that product data is displayed
    expect(screen.getByText('TEST-001')).toBeInTheDocument()
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('should show action buttons', async () => {
    mockUseGetProducts.mockReturnValue({
      data: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        has_next: false,
        has_previous: false
      },
      isLoading: false,
      isError: false
    })

    renderWithProviders(<ProductsTable />)

    await waitFor(() => {
      expect(screen.getByTestId('add-product-button')).toBeInTheDocument()
      expect(screen.getByTestId('import-csv-button')).toBeInTheDocument()
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ProductsTable } from './products-table'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'

// Mock the useProducts hook
const mockUseProducts = vi.fn()
const mockUseCreateProduct = vi.fn(() => ({
  mutate: vi.fn(),
  isPending: false
}))
const mockUseUploadProductsCSV = vi.fn(() => ({
  mutate: vi.fn(),
  isPending: false
}))

vi.mock('@/services/hooks/use-products', () => ({
  useProducts: () => mockUseProducts(),
  useCreateProduct: () => mockUseCreateProduct(),
  useUploadProductsCSV: () => mockUseUploadProductsCSV()
}))

const mockMessages = {
  products: {
    title: 'Products',
    table: {
      addButton: 'Add Product',
      addCSVButton: 'Import CSV',
      columns: {
        sku: 'SKU',
        name: 'Name',
        category: 'Category',
        price: 'Price',
        refrigerated: 'Refrigerated',
        provider: 'Provider'
      }
    },
    modal: {
      title: 'Add Product',
      description: 'Fill the form to add a new product',
      fields: {
        sku: 'SKU',
        name: 'Name',
        category: 'Category',
        price: 'Price',
        refrigerated: 'Refrigerated',
        provider: 'Provider'
      },
      buttons: {
        cancel: 'Cancel',
        create: 'Create'
      }
    },
    csvModal: {
      title: 'Import CSV',
      description: 'Upload a CSV file with products',
      fields: {
        file: 'File',
        fileDescription: 'Select a CSV file'
      },
      buttons: {
        cancel: 'Cancel',
        upload: 'Upload'
      }
    }
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false
    }
  }
})

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider messages={mockMessages} locale="es">
        {children}
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

describe('ProductsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render products table', async () => {
    mockUseProducts.mockReturnValue({
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

    render(
      <Wrapper>
        <ProductsTable />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Check that product data is displayed
    expect(screen.getByText('TEST-001')).toBeInTheDocument()
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('should show action buttons', async () => {
    mockUseProducts.mockReturnValue({
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

    render(
      <Wrapper>
        <ProductsTable />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('add-product-button')).toBeInTheDocument()
      expect(screen.getByTestId('import-csv-button')).toBeInTheDocument()
    })
  })
})

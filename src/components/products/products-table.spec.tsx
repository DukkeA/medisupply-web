import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ProductsTable } from './products-table'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'

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
      retry: false,
    },
  },
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
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ([{
        id: '1',
        sku: 'TEST-001',
        name: 'Test Product',
        category: 'Test Category',
        price: 100,
        refrigerated: false,
        provider: 'Test Provider'
      }])
    })

    render(
      <Wrapper>
        <ProductsTable />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('products-table')).toBeInTheDocument()
    })
  })

  it('should show action buttons', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ([])
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
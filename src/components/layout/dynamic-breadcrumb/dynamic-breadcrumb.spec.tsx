import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ProductsTable } from './products-table'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'

const mockMessages = {
  products: {
    title: 'Products',
    add: 'Add Product',
    import: 'Import CSV',
    headers: {
      sku: 'SKU',
      name: 'Name',
      category: 'Category',
      price: 'Price',
      refrigerated: 'Refrigerated',
      provider: 'Provider'
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
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })
})
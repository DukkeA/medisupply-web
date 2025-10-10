import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateProductModal } from './create-product-modal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import { toast } from 'sonner'

// Add toast mock
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}))

// Add ResizeObserver mock
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Setup before all tests
beforeAll(() => {
  window.ResizeObserver = ResizeObserverMock
})

const mockMessages = {
    products: {
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
          create: 'Create',
          creating: 'Creating...' // si usas isPending
        },
        toastError: 'Error creating product',
        toastSuccess: 'Product created successfully' // <-- faltaba
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

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <NextIntlClientProvider messages={mockMessages} locale="es">
      {children}
    </NextIntlClientProvider>
  </QueryClientProvider>
)

// ...rest of test file remains the same...

describe('CreateProductModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockOnOpenChange = vi.fn()

  it('renders correctly when open', () => {
    render(
      <TestWrapper>
        <CreateProductModal open={true} onOpenChange={mockOnOpenChange} />
      </TestWrapper>
    )

    expect(screen.getByText('Add Product')).toBeInTheDocument()
    expect(screen.getByText('Fill the form to add a new product')).toBeInTheDocument()
  })

  it('handles form input changes', () => {
    render(
      <TestWrapper>
        <CreateProductModal open={true} onOpenChange={mockOnOpenChange} />
      </TestWrapper>
    )

    const skuInput = screen.getByLabelText('SKU')
    fireEvent.change(skuInput, { target: { value: 'TEST-001' } })
    expect(skuInput).toHaveValue('TEST-001')

    const nameInput = screen.getByLabelText('Name')
    fireEvent.change(nameInput, { target: { value: 'Test Product' } })
    expect(nameInput).toHaveValue('Test Product')
  })

  it('submits form successfully', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 })
    })

    render(
      <TestWrapper>
        <CreateProductModal open={true} onOpenChange={mockOnOpenChange} />
      </TestWrapper>
    )

    fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'TEST-001' } })
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Product' } })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Test Category' } })
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText('Provider'), { target: { value: 'Test Provider' } })

    fireEvent.click(screen.getByText('Create'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/products', expect.any(Object))
    })
  })

  it('handles submission error', async () => {
    vi.clearAllMocks()
    const mockOnOpenChange = vi.fn()
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('API Error'))
  
    render(
      <TestWrapper>
        <CreateProductModal open={true} onOpenChange={mockOnOpenChange} />
      </TestWrapper>
    )
  
    // Fill and submit form
    fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'TEST-001' } })
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Product' } })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Test Category' } })
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText('Provider'), { target: { value: 'Test Provider' } })
    
    await fireEvent.click(screen.getByRole('button', { name: /create/i }))
  
    // Update expectation to match actual translation key
    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Error'))

    })
  })

  it('closes modal on cancel', () => {
    render(
      <TestWrapper>
        <CreateProductModal open={true} onOpenChange={mockOnOpenChange} />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
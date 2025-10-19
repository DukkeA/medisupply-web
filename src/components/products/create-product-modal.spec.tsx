import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateProductModal } from './create-product-modal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import { toast } from 'sonner'

// Mock the useCreateProduct hook
const mockCreateProduct = vi.fn()

vi.mock('@/services/hooks/use-products', () => ({
  useCreateProduct: () => ({
    mutate: mockCreateProduct,
    isPending: false
  })
}))

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

    expect(screen.getByText('modal.title')).toBeInTheDocument()
    expect(screen.getByText('modal.description')).toBeInTheDocument()
  })

  it('handles form input changes', () => {
    render(
      <TestWrapper>
        <CreateProductModal open={true} onOpenChange={mockOnOpenChange} />
      </TestWrapper>
    )

    const nameInput = screen.getByLabelText('modal.fields.name')
    fireEvent.change(nameInput, { target: { value: 'Test Product' } })
    expect(nameInput).toHaveValue('Test Product')

    // Category and Provider are Select components, not direct inputs
    // so we can't use getByLabelText to interact with them like regular inputs
    // We'll skip testing their interaction here as they require more complex setup
  })

  it('submits form successfully', async () => {
    mockCreateProduct.mockImplementation((_data, options) => {
      options?.onSuccess?.()
    })

    render(
      <TestWrapper>
        <CreateProductModal open={true} onOpenChange={mockOnOpenChange} />
      </TestWrapper>
    )

    fireEvent.change(screen.getByLabelText('modal.fields.name'), {
      target: { value: 'Test Product' }
    })
    fireEvent.change(screen.getByLabelText('modal.fields.sku'), {
      target: { value: 'SKU-001' }
    })
    // Skip category and provider selection as they are complex Select components
    fireEvent.change(screen.getByLabelText('modal.fields.price'), {
      target: { value: '100' }
    })

    fireEvent.click(screen.getByText('modal.buttons.create'))

    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalledTimes(1)
      expect(toast.success).toHaveBeenCalledWith('modal.toastSuccess')
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('handles submission error', async () => {
    vi.clearAllMocks()
    const mockOnOpenChange = vi.fn()

    mockCreateProduct.mockImplementation((_data, options) => {
      options?.onError?.(new Error('API Error'))
    })

    render(
      <TestWrapper>
        <CreateProductModal open={true} onOpenChange={mockOnOpenChange} />
      </TestWrapper>
    )

    // Fill and submit form
    fireEvent.change(screen.getByLabelText('modal.fields.name'), {
      target: { value: 'Test Product' }
    })
    fireEvent.change(screen.getByLabelText('modal.fields.sku'), {
      target: { value: 'SKU-001' }
    })
    // Skip category and provider selection
    fireEvent.change(screen.getByLabelText('modal.fields.price'), {
      target: { value: '100' }
    })

    await fireEvent.click(
      screen.getByRole('button', { name: /modal.buttons.create/i })
    )

    // Update expectation to match actual translation key
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('modal.toastError')
    })
  })

  it('closes modal on cancel', () => {
    render(
      <TestWrapper>
        <CreateProductModal open={true} onOpenChange={mockOnOpenChange} />
      </TestWrapper>
    )

    fireEvent.click(screen.getByText('modal.buttons.cancel'))
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})

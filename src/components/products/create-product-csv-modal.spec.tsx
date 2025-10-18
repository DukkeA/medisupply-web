import React, { PropsWithChildren } from 'react'
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateProductCSVModal } from './create-product-csv-modal'
import { toast } from 'sonner'

/* ─────────────────── Mocks ─────────────────── */
const mockUploadCSV = vi.fn()

vi.mock('@/services/hooks/use-products', () => ({
  useUploadProductsCSV: () => ({
    mutate: mockUploadCSV,
    isPending: false
  })
}))

/* ─────────────────── Helpers tipados ─────────────────── */

// ResizeObserver (evita warnings de UI libs en jsdom)
class ResizeObserverMock implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): ResizeObserverEntry[] {
    return []
  }
}
beforeAll(() => {
  // Tipado estricto del constructor global
  ;(
    window as unknown as { ResizeObserver: typeof ResizeObserver }
  ).ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
})

// Query Client wrapper
const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } })

const wrap = (ui: React.ReactNode) =>
  render(<QueryClientProvider client={makeClient()}>{ui}</QueryClientProvider>)

// Archivo CSV de prueba
const csv = (name = 'products.csv') =>
  new File(['a,b\n1,2'], name, { type: 'text/csv' })

afterEach(() => {
  vi.clearAllMocks()
})

/* ─────────────────── Tests ─────────────────── */

describe('CreateProductCSVModal', () => {
  it('should render and close when cancel is clicked', () => {
    const onOpenChange = vi.fn()
    wrap(<CreateProductCSVModal open={true} onOpenChange={onOpenChange} />)

    expect(screen.getByText('csvModal.title')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: /csvModal.buttons.cancel/i })
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should select CSV file and submit successfully', async () => {
    const onOpenChange = vi.fn()

    mockUploadCSV.mockImplementation((_file, options) => {
      options?.onSuccess?.()
    })

    wrap(<CreateProductCSVModal open={true} onOpenChange={onOpenChange} />)

    // 1) Seleccionar archivo (se refleja el nombre)
    const fileInput = screen.getByTestId('csv-file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [csv()] } })
    await waitFor(() =>
      expect(screen.getByText('products.csv')).toBeInTheDocument()
    )

    // 2) Submit directo del formulario
    const form = screen.getByTestId('csv-form')
    fireEvent.submit(form)

    // 3) Se llamó mockUploadCSV con el archivo
    await waitFor(() => expect(mockUploadCSV).toHaveBeenCalledTimes(1))
    const [file] = mockUploadCSV.mock.calls[0]
    expect(file.name).toBe('products.csv')

    // 4) Éxito y cierre
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('csvModal.toastSuccess')
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('should display error toast when server returns error', async () => {
    const onOpenChange = vi.fn()

    mockUploadCSV.mockImplementation((_file, options) => {
      options?.onError?.(new Error('Upload failed'))
    })

    wrap(<CreateProductCSVModal open={true} onOpenChange={onOpenChange} />)

    // 1) Seleccionar archivo
    const fileInput = screen.getByTestId('csv-file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [csv()] } })

    // 2) Esperar nombre visible
    await waitFor(() =>
      expect(screen.getByText('products.csv')).toBeInTheDocument()
    )

    // 3) Submit
    const form = screen.getByTestId('csv-form')
    fireEvent.submit(form)

    // 4) se llamó mockUploadCSV
    await waitFor(() => expect(mockUploadCSV).toHaveBeenCalled())

    // 5) toast de error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('csvModal.toastError')
    })
  })
})

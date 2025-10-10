// create-product-csv-modal.min.spec.tsx (corregido)
import React from 'react'
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateProductCSVModal } from './create-product-csv-modal'
import { toast } from 'sonner'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('next-intl', async () => {
  const actual = await vi.importActual<any>('next-intl')
  return {
    ...actual,
    useTranslations: () => (key: string) => key, // devuelve solo la clave
    NextIntlClientProvider: ({ children }: any) => children
  }
})

class ResizeObserverMock { observe(){} unobserve(){} disconnect(){} }
beforeAll(() => {
  window.ResizeObserver = ResizeObserverMock
})

const makeClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
const wrap = (ui: React.ReactNode) =>
  render(<QueryClientProvider client={makeClient()}>{ui}</QueryClientProvider>)
const csv = (name='products.csv') => new File(['a,b\n1,2'], name, { type: 'text/csv' })

afterEach(() => {
  vi.clearAllMocks()
  // @ts-expect-error
  global.fetch = undefined
})

describe('CreateProductCSVModal (mínimo para cobertura)', () => {
  it('render básico y cancel cierra', () => {
    const onOpenChange = vi.fn()
    wrap(<CreateProductCSVModal open={true} onOpenChange={onOpenChange} />)

    expect(screen.getByText('csvModal.title')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /csvModal.buttons.cancel/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('flujo feliz: selecciona CSV y envía OK', async () => {
    const onOpenChange = vi.fn()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ count: 10 }),
    } as any)
  
    wrap(<CreateProductCSVModal open={true} onOpenChange={onOpenChange} />)
  
    // 1) Selecciona archivo y espera que quede en estado (se muestra el nombre)
    const fileInput = screen.getByTestId('csv-file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [csv()] } })
    await waitFor(() => {
      expect(screen.getByText('products.csv')).toBeInTheDocument()
    })
  
    // 2) Envía el formulario directamente (evita fricciones del required)
    const form = screen.getByTestId('csv-form')
    fireEvent.submit(form)
  
    // 3) Asegura que se llamó fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  
    // 4) Valida argumentos sin usar toHaveBeenCalledWith (lee la llamada y afirma por partes)
    const [url, init] = (global.fetch as vi.Mock).mock.calls[0]
    expect(url).toBe('/api/products/upload')
    expect(init.method).toBe('POST')
    expect(init.credentials).toBe('include')
    expect(init.body).toBeInstanceOf(FormData)
  
    // 5) Señales del éxito
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('csvModal.toastSuccess')
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
  

  it('error de servidor: muestra toast.error', async () => {
    const onOpenChange = vi.fn()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as any)
  
    wrap(<CreateProductCSVModal open={true} onOpenChange={onOpenChange} />)
  
    // 1) Seleccionar archivo
    const fileInput = screen.getByTestId('csv-file-input') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [csv()] } })
  
    // 2) Esperar a que el estado se refleje (aparece el nombre)
    await waitFor(() => {
      expect(screen.getByText('products.csv')).toBeInTheDocument()
    })
  
    // 3) Disparar el submit del formulario directamente (evita fricciones del required en jsdom)
    const form = screen.getByTestId('csv-form')
    fireEvent.submit(form)
  
    // 4) Asegurar que la mutación llamó a fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  
    // 5) Verificar el toast de error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('csvModal.toastError')
    })
  })
  
  
  
})

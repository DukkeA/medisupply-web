// create-provider-modal.min.spec.tsx
import React from 'react'
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateProviderModal } from './create-provider-modal'
import { toast } from 'sonner'

// --- Mocks ---
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('next-intl', async () => {
  const actual = await vi.importActual<any>('next-intl')
  return {
    ...actual,
    useTranslations: () => (key: string) => key, // devuelve la clave (sin namespace)
    NextIntlClientProvider: ({ children }: any) => children,
  }
})
vi.mock('../ui/location-input', () => ({
  __esModule: true,
  default: ({ onCountryChange }: any) => (
    <button
      type="button"
      aria-label="select-country"
      onClick={() => onCountryChange?.({ name: 'Colombia' })}
    >
      select-country
    </button>
  ),
}))

class ResizeObserverMock { observe(){} unobserve(){} disconnect(){} }
beforeAll(() => {
  // @ts-expect-error
  window.ResizeObserver = ResizeObserverMock
})

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } })

const wrap = (ui: React.ReactNode) =>
  render(<QueryClientProvider client={makeClient()}>{ui}</QueryClientProvider>)

afterEach(() => {
  vi.clearAllMocks()
  // @ts-expect-error
  global.fetch = undefined
})

const fillBasics = () => {
  fireEvent.change(screen.getByLabelText('modal.fields.name'), { target: { value: 'John Doe' } })
  fireEvent.change(screen.getByLabelText('modal.fields.company'), { target: { value: 'Acme' } })
  fireEvent.change(screen.getByLabelText('modal.fields.nit'), { target: { value: '123' } })
  fireEvent.change(screen.getByLabelText('modal.fields.email'), { target: { value: 'john@example.com' } })
  fireEvent.change(screen.getByLabelText('modal.fields.phone'), { target: { value: '+1 234' } })
  fireEvent.change(screen.getByLabelText('modal.fields.address'), { target: { value: 'Main St' } })
  fireEvent.click(screen.getByRole('button', { name: /select-country/i })) // mock LocationSelector
}

describe('CreateProviderModal (mínimo para cobertura)', () => {
  it('render básico y cierra con Cancel', () => {
    const onOpenChange = vi.fn()
    wrap(<CreateProviderModal open={true} onOpenChange={onOpenChange} />)

    expect(screen.getByText('modal.title')).toBeInTheDocument()
    expect(screen.getByText('modal.description')).toBeInTheDocument()

    // existe el form en el portal
    const form = screen.getByTestId('provider-form') as HTMLFormElement
    expect(form).toBeTruthy()

    // cancelar
    fireEvent.click(screen.getByTestId('cancel-provider'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('flujo feliz: completa campos, envía y muestra toast.success', async () => {
    const onOpenChange = vi.fn()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    } as any)

    wrap(<CreateProviderModal open={true} onOpenChange={onOpenChange} />)

    fillBasics()

    // submit directo al form (estable con portal)
    const form = screen.getByTestId('provider-form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    const [url, init] = (global.fetch as vi.Mock).mock.calls[0]
    expect(url).toBe('/api/providers')
    expect(init.method).toBe('POST')
    expect(init.credentials).toBe('include')
    expect(init.headers).toEqual(expect.objectContaining({ 'Content-Type': 'application/json' }))
    expect(typeof init.body).toBe('string')

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('modal.toastSuccess')
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('error del servidor: muestra toast.error', async () => {
    const onOpenChange = vi.fn()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as any)

    wrap(<CreateProviderModal open={true} onOpenChange={onOpenChange} />)

    fillBasics()

    const form = screen.getByTestId('provider-form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('modal.toastError'))
  })
})

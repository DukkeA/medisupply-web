import React from 'react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProvidersTable } from './providers-table'

// --- Mocks mínimos ---
vi.mock('next-intl', async () => {
  const actual = await vi.importActual<any>('next-intl')
  return {
    ...actual,
    useTranslations: () => (key: string) => key, // devuelve la clave (sin namespace)
    NextIntlClientProvider: ({ children }: any) => children,
  }
})

// Stub del modal para evitar portal y validar apertura/cierre
vi.mock('@/components/proveedores/create-provider-modal', () => ({
  __esModule: true,
  CreateProviderModal: ({ open, onOpenChange }: any) => (
    open ? (
      <div data-testid="provider-modal">
        modal abierto
        <button onClick={() => onOpenChange(false)}>close</button>
      </div>
    ) : null
  ),
}))

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } })

const renderWithClient = (ui: React.ReactNode) =>
  render(<QueryClientProvider client={makeClient()}>{ui}</QueryClientProvider>)

afterEach(() => {
  vi.clearAllMocks()
  // @ts-expect-error
  global.fetch = undefined
})

beforeEach(() => {
  // Asegúrate de no usar initialData del env
  // @ts-expect-error
  delete process.env.NEXT_PUBLIC_MOCK_DATA
})

describe('ProvidersTable (mínimo para cobertura)', () => {
  it('muestra Loading… y luego renderiza datos (éxito)', async () => {
    const rows = [
      {
        id: '1', name: 'Alice', company: 'Acme', nit: 'N1',
        email: 'a@x.com', phone: '111', address: 'Street 1', country: 'CO'
      },
      {
        id: '2', name: 'Bob', company: 'Globex', nit: 'N2',
        email: 'b@y.com', phone: '222', address: 'Street 2', country: 'US'
      },
    ]
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => rows,
    } as any)

    renderWithClient(<ProvidersTable />)

    // estado inicial
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // datos cargados
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/providers')
      expect(screen.getByText('table.columns.name')).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Globex')).toBeInTheDocument()
    })
  })

  it('muestra "no data" cuando API retorna [] y abre el modal al click', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as any)

    renderWithClient(<ProvidersTable />)

    // Espera directamente el contenido final (no solo la llamada a fetch)
    expect(await screen.findByText('table.noData')).toBeInTheDocument()

    // abre el modal
    fireEvent.click(screen.getByRole('button', { name: /table.addButton/i }))
    expect(screen.getByTestId('provider-modal')).toBeInTheDocument()

    // (opcional) cerrar modal desde el stub
    fireEvent.click(screen.getByText('close'))
    await waitFor(() => {
      expect(screen.queryByTestId('provider-modal')).not.toBeInTheDocument()
    })
  })

  it('muestra mensaje de error cuando la consulta falla', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as any)

    renderWithClient(<ProvidersTable />)

    await waitFor(() => {
      expect(screen.getByText('Error loading providers.')).toBeInTheDocument()
    })
  })
})

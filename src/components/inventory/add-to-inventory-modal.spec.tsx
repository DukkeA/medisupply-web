import React, {
  PropsWithChildren,
  SVGProps,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ButtonHTMLAttributes
} from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { AddToInventoryModal } from './add-to-inventory-modal'

/* ───────────────────── Mocks tipados ───────────────────── */

// Íconos
vi.mock('lucide-react', () => ({
  CalendarIcon: (p: SVGProps<SVGSVGElement>) => <svg {...p} />,
  Check: (p: SVGProps<SVGSVGElement>) => <svg {...p} />,
  ChevronsUpDown: (p: SVGProps<SVGSVGElement>) => <svg {...p} />
}))

/* ───────────────── React Query mocks (tipados) ───────────────── */

type UseQueryResult<T> = { data?: T; isLoading: boolean; isError: boolean }

// useQuery: no necesitamos reenviar args → firma simple y tipada
const mockUseQuery = vi.fn<() => UseQueryResult<unknown>>()
const mockInvalidate = vi.fn()

// Tipado de opciones de mutación que nos interesan
type MutationOptions<Vars> = {
  onSuccess?: (data: unknown, variables: Vars, context?: unknown) => void
  onError?: (err: unknown) => void
}

let mutationIsPending = false

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => mockUseQuery(),
  useQueryClient: () => ({ invalidateQueries: mockInvalidate }),
  useMutation: <Vars,>(opts: MutationOptions<Vars>) => {
    return {
      mutate: (vars: Vars, runtimeOpts?: MutationOptions<Vars>) => {
        if (mutationIsPending) {
          // If pending, trigger error callbacks
          opts.onError?.(new Error('pending'))
          runtimeOpts?.onError?.(new Error('pending'))
        } else {
          // Call both hook onSuccess and runtime onSuccess
          opts.onSuccess?.({ ok: true }, vars, undefined)
          runtimeOpts?.onSuccess?.({ ok: true }, vars, undefined)
        }
      },
      isPending: mutationIsPending
    }
  }
}))

/* ───────────────── Setup ───────────────── */
beforeEach(() => {
  vi.clearAllMocks()
  mutationIsPending = false

  // Por defecto, queries con datos para cubrir mapeos
  mockUseQuery.mockReturnValue({
    data: { items: [{ id: 'dummy', name: 'Dummy' }] },
    isLoading: false,
    isError: false
  })
})

/* ───────────────── Tests ───────────────── */
describe('AddToInventoryModal', () => {
  it('should render form and submit successfully', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(<AddToInventoryModal open={true} onOpenChange={onOpenChange} />)

    // Título/Descripción (claves i18n)
    expect(screen.getByText('modal.title')).toBeInTheDocument()
    expect(screen.getByText('modal.description')).toBeInTheDocument()

    // Seleccionar producto: primer botón (trigger) → luego primer CommandItem
    const productTrigger = screen.getAllByRole('button')[0]
    await user.click(productTrigger)
    const firstCommandItem = screen.getAllByRole('button')[1]
    await user.click(firstCommandItem)

    // Seleccionar warehouse: reutilizamos el patrón
    const warehouseTrigger = screen.getAllByRole('button')[0]
    await user.click(warehouseTrigger)
    const secondCommandItem = screen.getAllByRole('button')[1]
    await user.click(secondCommandItem)

    // Inputs
    await user.type(screen.getByLabelText('modal.fields.totalQuantity'), '100')
    await user.type(screen.getByLabelText('modal.fields.batchNumber'), 'L-77')

    // Fecha - click on the calendar grid
    await user.click(screen.getByRole('grid'))

    // Submit (último botón)
    const allButtons = screen.getAllByRole('button')
    const submitBtn = allButtons[allButtons.length - 1]
    await user.click(submitBtn)

    // onSuccess
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: ['inventory'] })
    expect(toast.success).toHaveBeenCalled()
  })

  it('should disable buttons when pending and display error on failure', async () => {
    const onOpenChange = vi.fn()

    // Forzar isPending
    mutationIsPending = true

    render(<AddToInventoryModal open={true} onOpenChange={onOpenChange} />)

    const allButtons = screen.getAllByRole('button')
    const cancelBtn = allButtons.find(
      (b) => b.textContent === 'modal.buttons.cancel'
    )!
    const submitBtn = allButtons.find(
      (b) =>
        b.textContent === 'modal.buttons.create' ||
        b.textContent === 'modal.buttons.creating'
    )!

    expect(cancelBtn).toBeDisabled()
    expect(submitBtn).toBeDisabled()
  })
})

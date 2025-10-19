import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { toast } from 'sonner'
import { CreateVendorPlanModal } from './create-vendor-plan-modal'

/* ──────────────── React Query mocks ──────────────── */

// useQuery (vendors) + useMutation + useQueryClient
type UseQueryResult<T> = { data?: T; isLoading: boolean; isError: boolean }
const mockUseQuery = vi.fn<() => UseQueryResult<unknown>>()
const mockInvalidate = vi.fn()

type MutationOptions<Vars> = {
  onSuccess?: (data: unknown, vars: Vars, ctx?: unknown) => void
  onError?: (err: unknown) => void
}
let mutationIsPending = false
let lastMutationOptions: MutationOptions<unknown> | undefined

vi.mock('@tanstack/react-query', () => {
  const defaultQuery: UseQueryResult<unknown> = {
    isLoading: false,
    isError: false,
    data: { items: [] }
  }
  return {
    useQuery: () => mockUseQuery() ?? defaultQuery,
    useQueryClient: () => ({ invalidateQueries: mockInvalidate }),
    useMutation: <Vars,>(opts: MutationOptions<Vars>) => {
      lastMutationOptions = opts as MutationOptions<unknown>
      return {
        mutate: (vars: Vars) => opts.onSuccess?.({}, vars, undefined),
        isPending: mutationIsPending
      }
    }
  }
})

/* ──────────────── Tests ──────────────── */

describe('CreateVendorPlanModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutationIsPending = false
    lastMutationOptions = undefined
    mockUseQuery.mockReset()
    mockUseQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [{ id: 10, name: 'Vendor X' }] }
    })
  })

  it('should render title and description and allow cancellation', () => {
    const onOpenChange = vi.fn()
    render(<CreateVendorPlanModal open={true} onOpenChange={onOpenChange} />)

    expect(screen.getByText('createTitle')).toBeInTheDocument()
    expect(screen.getByText('createDescription')).toBeInTheDocument()

    const cancelBtn = screen.getByRole('button', { name: 'cancel' })
    fireEvent.click(cancelBtn)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should submit form successfully when vendor is selected', () => {
    const onOpenChange = vi.fn()
    render(<CreateVendorPlanModal open={true} onOpenChange={onOpenChange} />)

    // Find the combobox button by its text content
    const vendorCombobox = screen.getByRole('combobox')
    fireEvent.click(vendorCombobox)

    // The vendor name should appear after opening the popover
    const vendorOption = screen.getByText('Vendor X')
    fireEvent.click(vendorOption)

    // Llenar form
    fireEvent.change(screen.getByLabelText('period'), {
      target: { value: '2025-Q1' }
    })
    fireEvent.change(screen.getByLabelText('goal'), {
      target: { value: '100000' }
    })

    // Submit
    const submitBtn = screen.getByRole('button', { name: /create|creating/ })
    fireEvent.click(submitBtn)

    // onSuccess
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: ['vendorPlans'] })
    expect(toast.success).toHaveBeenCalledWith('createSuccess')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should display error toast when submitting without vendor selection', () => {
    const onOpenChange = vi.fn()
    // Forzamos vendors pero NO se selecciona ninguno (selectedVendorId null)
    render(<CreateVendorPlanModal open={true} onOpenChange={onOpenChange} />)

    // Llenar campos requeridos
    fireEvent.change(screen.getByLabelText('period'), {
      target: { value: '2025-Q1' }
    })
    fireEvent.change(screen.getByLabelText('goal'), {
      target: { value: '100000' }
    })

    const submitBtn = screen.getByRole('button', { name: /create|creating/ })
    fireEvent.click(submitBtn)

    expect(toast.error).toHaveBeenCalledWith('selectVendor')
    // y no debería haberse cerrado el modal
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('should disable buttons when pending and display error on failure', () => {
    const onOpenChange = vi.fn()
    mutationIsPending = true

    render(<CreateVendorPlanModal open={true} onOpenChange={onOpenChange} />)

    const cancelBtn = screen.getByRole('button', { name: 'cancel' })
    const submitBtn = screen.getByRole('button', { name: /create|creating/ })
    expect(cancelBtn).toBeDisabled()
    expect(submitBtn).toBeDisabled()

    // Disparar onError manualmente para cubrir la rama
    lastMutationOptions?.onError?.(new Error('fail'))
    expect(toast.error).toHaveBeenCalledWith('createError')
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})

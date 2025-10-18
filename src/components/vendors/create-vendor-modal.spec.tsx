import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { toast } from 'sonner'
import { CreateVendorModal } from './create-vendor-modal'

/* ─────────────────── Mocks tipados ─────────────────── */

const mockCreateSeller = vi.fn()
let mockIsPending = false

vi.mock('@/services/hooks/use-sellers', () => ({
  useCreateSeller: () => ({
    mutate: mockCreateSeller,
    isPending: mockIsPending
  })
}))

// LocationSelector: expone 2 botones para disparar onCountryChange y onStateChange
type CountryOrState = { name: string }
vi.mock('../ui/location-input', () => ({
  __esModule: true,
  default: ({
    onCountryChange,
    onStateChange,
    countryLabel,
    stateLabel,
    showStates
  }: {
    onCountryChange?: (c?: CountryOrState) => void
    onStateChange?: (s?: CountryOrState) => void
    countryLabel?: string
    stateLabel?: string
    showStates?: boolean
  }) => (
    <div>
      <button
        type="button"
        aria-label={countryLabel ?? 'country'}
        onClick={() => onCountryChange?.({ name: 'Colombia' })}
      >
        select-country
      </button>
      {showStates ? (
        <button
          type="button"
          aria-label={stateLabel ?? 'state'}
          onClick={() => onStateChange?.({ name: 'Andina' })}
        >
          select-state
        </button>
      ) : null}
    </div>
  )
}))

/* ─────────────────── Tests ─────────────────── */

describe('CreateVendorModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsPending = false
  })

  it('should render title and description and allow cancellation', () => {
    const onOpenChange = vi.fn()
    render(<CreateVendorModal open={true} onOpenChange={onOpenChange} />)

    expect(screen.getByText('modal.title')).toBeInTheDocument()
    expect(screen.getByText('modal.description')).toBeInTheDocument()

    // botón cancelar
    const cancelBtn = screen.getByRole('button', {
      name: 'modal.buttons.cancel'
    })
    fireEvent.click(cancelBtn)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should submit form successfully with country and territory selection', () => {
    const onOpenChange = vi.fn()

    mockCreateSeller.mockImplementation((data, options) => {
      options?.onSuccess?.()
    })

    render(<CreateVendorModal open={true} onOpenChange={onOpenChange} />)

    // Inputs por label
    fireEvent.change(screen.getByLabelText('modal.fields.name'), {
      target: { value: 'John' }
    })
    fireEvent.change(screen.getByLabelText('modal.fields.email'), {
      target: { value: 'john@example.com' }
    })
    fireEvent.change(screen.getByLabelText('modal.fields.phone'), {
      target: { value: '+57 123' }
    })

    // LocationSelector (country/state)
    fireEvent.click(
      screen.getByRole('button', { name: 'modal.fields.country' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'modal.fields.territory' })
    )

    // Submit
    const submitBtn = screen.getByRole('button', {
      name: /modal\.buttons\.create|modal\.buttons\.creating/
    })
    fireEvent.click(submitBtn)

    // onSuccess → cierra modal y muestra toast.success
    expect(mockCreateSeller).toHaveBeenCalledWith(
      {
        name: 'John',
        email: 'john@example.com',
        phone: '+57 123',
        country: 'Colombia',
        city: 'Andina'
      },
      expect.any(Object)
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(toast.success).toHaveBeenCalledWith('modal.toastSuccess')
  })

  it('should disable buttons when pending and display error on failure', () => {
    const onOpenChange = vi.fn()

    // First test with isPending = true to verify buttons are disabled
    mockIsPending = true
    const { unmount } = render(
      <CreateVendorModal open={true} onOpenChange={onOpenChange} />
    )

    const cancelBtn = screen.getByRole('button', {
      name: 'modal.buttons.cancel'
    })
    const submitBtn = screen.getByRole('button', {
      name: /modal\.buttons\.create|modal\.buttons\.creating/
    })

    expect(cancelBtn).toBeDisabled()
    expect(submitBtn).toBeDisabled()
    unmount()

    // Now test error handling with isPending = false so form can be submitted
    mockIsPending = false
    mockCreateSeller.mockImplementation((_data, options) => {
      options?.onError?.(new Error('fail'))
    })

    render(<CreateVendorModal open={true} onOpenChange={onOpenChange} />)

    // Fill form
    fireEvent.change(screen.getByLabelText('modal.fields.name'), {
      target: { value: 'John' }
    })
    fireEvent.change(screen.getByLabelText('modal.fields.email'), {
      target: { value: 'john@example.com' }
    })
    fireEvent.change(screen.getByLabelText('modal.fields.phone'), {
      target: { value: '+57 123' }
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'modal.fields.country' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'modal.fields.territory' })
    )

    // Submit
    const newSubmitBtn = screen.getByRole('button', {
      name: /modal\.buttons\.create|modal\.buttons\.creating/
    })
    fireEvent.click(newSubmitBtn)

    expect(toast.error).toHaveBeenCalledWith('modal.toastError')
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})

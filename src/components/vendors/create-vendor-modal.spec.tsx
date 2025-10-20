import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { z } from 'zod'
import { CreateVendorModal } from './create-vendor-modal'

/* ─────────────────── Mocks tipados ─────────────────── */

// Mock validation schema to always pass
vi.mock('@/lib/validations/seller-schema', () => ({
  createSellerSchema: () =>
    z.object({
      name: z.string(),
      email: z.string(),
      phone: z.string(),
      country: z.string(),
      city: z.string()
    })
}))

const mockCreateSeller = vi.fn()
let mockIsPending = false

vi.mock('@/services/hooks/use-sellers', () => ({
  useCreateSeller: () => ({
    mutate: mockCreateSeller,
    isPending: mockIsPending
  })
}))

/* ─────────────────── Tests ─────────────────── */

describe('CreateVendorModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsPending = false
  })

  it('should render title and description and allow cancellation', async () => {
    const onOpenChange = vi.fn()
    render(<CreateVendorModal open={true} onOpenChange={onOpenChange} />)

    await waitFor(() => {
      expect(screen.getByText('modal.title')).toBeInTheDocument()
      expect(screen.getByText('modal.description')).toBeInTheDocument()
    })

    // botón cancelar
    const cancelBtn = screen.getByRole('button', {
      name: 'modal.buttons.cancel'
    })
    fireEvent.click(cancelBtn)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should submit form successfully with country and territory selection', async () => {
    const onOpenChange = vi.fn()

    mockCreateSeller.mockImplementation((_data, options) => {
      options?.onSuccess?.()
    })

    render(<CreateVendorModal open={true} onOpenChange={onOpenChange} />)

    // Inputs by placeholder
    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { value: 'John' }
    })
    fireEvent.change(screen.getByPlaceholderText('john@example.com'), {
      target: { value: 'john@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('+1 234 567 8900'), {
      target: { value: '+57 123' }
    })

    // LocationSelector (country/state)
    fireEvent.click(
      screen.getByRole('button', { name: 'modal.fields.country' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'modal.fields.territory' })
    )

    // Wait for button to be enabled
    const submitBtn = await waitFor(() => {
      const btn = screen.getByRole('button', {
        name: /modal\.buttons\.create|modal\.buttons\.creating/
      })
      expect(btn).not.toBeDisabled()
      return btn
    })

    fireEvent.click(submitBtn)

    // onSuccess → cierra modal y muestra toast.success
    await waitFor(() => {
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
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(toast.success).toHaveBeenCalledWith('modal.toastSuccess')
  })

  it('should disable buttons when pending and display error on failure', async () => {
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
    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { value: 'John' }
    })
    fireEvent.change(screen.getByPlaceholderText('john@example.com'), {
      target: { value: 'john@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('+1 234 567 8900'), {
      target: { value: '+57 123' }
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'modal.fields.country' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'modal.fields.territory' })
    )

    // Wait for button to be enabled before clicking
    const newSubmitBtn = await waitFor(() => {
      const btn = screen.getByRole('button', {
        name: /modal\.buttons\.create|modal\.buttons\.creating/
      })
      expect(btn).not.toBeDisabled()
      return btn
    })

    fireEvent.click(newSubmitBtn)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('modal.toastError')
    })
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})

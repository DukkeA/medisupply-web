import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { z } from 'zod'
import { renderWithProviders } from '@/__tests__/test-utils'
import { CreateWarehouseModal } from './create-warehouse-modal'

/* ─────────── Mocks tipados ─────────── */

// Mock validation schema to always pass
vi.mock('@/lib/validations/warehouse-schema', () => ({
  createWarehouseSchema: () =>
    z.object({
      name: z.string(),
      address: z.string(),
      country: z.string(),
      city: z.string()
    })
}))

const mockMutate = vi.fn()
let mockIsPending = false

vi.mock('@/generated', async () => {
  const actual = await vi.importActual('@/generated')
  return {
    ...actual,
    useCreateWarehouseBffWebWarehousePost: () => ({
      mutate: mockMutate,
      isPending: mockIsPending
    })
  }
})

/* ─────────── Tests ─────────── */
describe('CreateWarehouseModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsPending = false
  })

  it('should render title and description and allow cancellation', async () => {
    const onOpenChange = vi.fn()
    renderWithProviders(
      <CreateWarehouseModal open={true} onOpenChange={onOpenChange} />
    )

    await waitFor(() => {
      expect(screen.getByText('modal.title')).toBeInTheDocument()
      expect(screen.getByText('modal.description')).toBeInTheDocument()
    })

    const cancelBtn = screen.getByRole('button', {
      name: 'modal.buttons.cancel'
    })
    fireEvent.click(cancelBtn)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should submit form successfully with country and city selection', async () => {
    const onOpenChange = vi.fn()

    mockMutate.mockImplementation((_data, options) => {
      options?.onSuccess?.()
    })

    renderWithProviders(
      <CreateWarehouseModal open={true} onOpenChange={onOpenChange} />
    )

    // Inputs by placeholder
    fireEvent.change(screen.getByPlaceholderText('Main Warehouse'), {
      target: { value: 'Test Warehouse' }
    })
    fireEvent.change(
      screen.getByPlaceholderText('123 Main St, New York, USA'),
      {
        target: { value: '456 Test Ave' }
      }
    )

    // LocationSelector (country/city)
    fireEvent.click(
      screen.getByRole('button', { name: 'modal.fields.country' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'modal.fields.city' }))

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
      expect(mockMutate).toHaveBeenCalledWith(
        {
          data: {
            name: 'Test Warehouse',
            address: '456 Test Ave',
            country: 'Colombia',
            city: 'Andina'
          }
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
    const { unmount } = renderWithProviders(
      <CreateWarehouseModal open={true} onOpenChange={onOpenChange} />
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
    mockMutate.mockImplementation((_data, options) => {
      options?.onError?.(new Error('fail'))
    })

    renderWithProviders(
      <CreateWarehouseModal open={true} onOpenChange={onOpenChange} />
    )

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Main Warehouse'), {
      target: { value: 'Test Warehouse' }
    })
    fireEvent.change(
      screen.getByPlaceholderText('123 Main St, New York, USA'),
      {
        target: { value: '456 Test Ave' }
      }
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'modal.fields.country' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'modal.fields.city' }))

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

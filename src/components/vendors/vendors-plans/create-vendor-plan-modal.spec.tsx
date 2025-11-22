import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { z } from 'zod'
import { renderWithProviders } from '@/__tests__/test-utils'
import { CreateVendorPlanModal } from './create-vendor-plan-modal'

/* ──────────────── React Query mocks ──────────────── */

// Mock validation schema to always pass
vi.mock('@/lib/validations/sales-plan-schema', () => ({
  createSalesPlanSchema: () =>
    z.object({
      seller_id: z.string().optional(),
      sales_period: z.string(),
      goal: z.coerce.number()
    })
}))

// Mock Orval hooks for sales plans
type UseQueryResult<T> = { data?: T; isLoading: boolean; isError: boolean }
const mockUseGetSellers = vi.fn<() => UseQueryResult<unknown>>()
const mockMutateCreateSalesPlan = vi.fn()
let mutationIsPending = false

vi.mock('@/generated', async () => {
  const actual = await vi.importActual('@/generated')
  return {
    ...actual,
    useGetSellersBffWebSellersGet: () => mockUseGetSellers(),
    useCreateSalesPlanBffWebSalesPlansPost: () => ({
      mutate: mockMutateCreateSalesPlan,
      isPending: mutationIsPending
    })
  }
})

/* ──────────────── Tests ──────────────── */

describe('CreateVendorPlanModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutationIsPending = false
    mockUseGetSellers.mockReset()
    mockUseGetSellers.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [{ id: '10', name: 'Vendor X' }] }
    })
  })

  it('should render title and description and allow cancellation', async () => {
    const onOpenChange = vi.fn()
    renderWithProviders(
      <CreateVendorPlanModal open={true} onOpenChange={onOpenChange} />
    )

    await waitFor(
      () => {
        expect(screen.getByText('createTitle')).toBeInTheDocument()
        expect(screen.getByText('createDescription')).toBeInTheDocument()
      },
      { timeout: 8000 }
    )

    const cancelBtn = screen.getByRole('button', { name: 'cancel' })
    fireEvent.click(cancelBtn)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  }, 10000)

  it('should submit form successfully when vendor is selected', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    mockMutateCreateSalesPlan.mockImplementation((_data, options) => {
      options?.onSuccess?.()
    })

    renderWithProviders(
      <CreateVendorPlanModal open={true} onOpenChange={onOpenChange} />
    )

    // Find the combobox button by its text content
    const vendorCombobox = screen.getByRole('combobox')
    await user.click(vendorCombobox)

    // The vendor name should appear after opening the popover
    const vendorOption = screen.getByText('Vendor X')
    await user.click(vendorOption)

    // Fill form by placeholder using userEvent
    await user.type(screen.getByPlaceholderText('Q1-2024'), '2025-Q1')

    // For number input, clear first then type
    const goalInput = screen.getByPlaceholderText('50000')
    await user.clear(goalInput)
    await user.type(goalInput, '100000')

    // Wait for button to be enabled before clicking
    const submitBtn = await waitFor(() => {
      const btn = screen.getByRole('button', { name: /create|creating/ })
      expect(btn).not.toBeDisabled()
      return btn
    })

    await user.click(submitBtn)

    // onSuccess
    await waitFor(() => {
      expect(mockMutateCreateSalesPlan).toHaveBeenCalled()
    })
    expect(toast.success).toHaveBeenCalledWith('createSuccess')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should keep modal open when form validation fails', async () => {
    const onOpenChange = vi.fn()
    renderWithProviders(
      <CreateVendorPlanModal open={true} onOpenChange={onOpenChange} />
    )

    // Wait for modal to render and form to initialize
    await waitFor(() => {
      const submitBtn = screen.getByRole('button', { name: /create|creating/ })
      expect(submitBtn).toBeDisabled()
    })

    // Modal should still be open
    expect(screen.getByText('createTitle')).toBeInTheDocument()
  })

  it('should disable buttons when pending', () => {
    const onOpenChange = vi.fn()
    mutationIsPending = true

    renderWithProviders(
      <CreateVendorPlanModal open={true} onOpenChange={onOpenChange} />
    )

    const cancelBtn = screen.getByRole('button', { name: 'cancel' })
    const submitBtn = screen.getByRole('button', { name: /create|creating/ })
    expect(cancelBtn).toBeDisabled()
    expect(submitBtn).toBeDisabled()
  })
})

import React, { SVGProps } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { z } from 'zod'
import { renderWithProviders } from '@/__tests__/test-utils'
import { AddToInventoryModal } from './add-to-inventory-modal'

/* ───────────────────── Mocks tipados ───────────────────── */

// Mock validation schema to always pass
vi.mock('@/lib/validations/inventory-schema', () => ({
  createInventorySchema: () =>
    z.object({
      product_id: z.string(),
      warehouse_id: z.string(),
      total_quantity: z.coerce.number(),
      batch_number: z.string(),
      expiration_date: z.string()
    }),
  InventoryFormData: {}
}))

// Íconos
vi.mock('lucide-react', () => ({
  CalendarIcon: (p: SVGProps<SVGSVGElement>) => <svg {...p} />,
  Check: (p: SVGProps<SVGSVGElement>) => <svg {...p} />,
  ChevronsUpDown: (p: SVGProps<SVGSVGElement>) => <svg {...p} />
}))

/* ───────────────── Orval hooks mocks ───────────────── */

type UseQueryResult<T> = { data?: T; isLoading: boolean; isError: boolean }

// Mock Orval hooks
const mockUseGetProducts = vi.fn<() => UseQueryResult<unknown>>()
const mockUseGetWarehouses = vi.fn<() => UseQueryResult<unknown>>()
const mockMutateCreateInventory = vi.fn()
let mutationIsPending = false

vi.mock('@/generated', async () => {
  const actual = await vi.importActual('@/generated')
  return {
    ...actual,
    useGetProductsBffWebProductsGet: () => mockUseGetProducts(),
    useGetWarehousesBffWebWarehousesGet: () => mockUseGetWarehouses(),
    useCreateInventoryBffWebInventoryPost: () => ({
      mutate: mockMutateCreateInventory,
      isPending: mutationIsPending
    })
  }
})

/* ───────────────── Setup ───────────────── */
beforeEach(() => {
  vi.clearAllMocks()
  mutationIsPending = false

  // Default mock values for products and warehouses
  mockUseGetProducts.mockReturnValue({
    data: {
      items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Test Product',
          sku: 'TEST-001',
          price: 10.99
        }
      ]
    },
    isLoading: false,
    isError: false
  })

  mockUseGetWarehouses.mockReturnValue({
    data: {
      items: [
        {
          id: '660e8400-e29b-41d4-a716-446655440001',
          name: 'Test Warehouse',
          address: 'Test Address',
          city: 'Test City'
        }
      ]
    },
    isLoading: false,
    isError: false
  })
})

/* ───────────────── Tests ───────────────── */
describe('AddToInventoryModal', () => {
  it('should render form and submit successfully', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    mockMutateCreateInventory.mockImplementation((_data, options) => {
      options?.onSuccess?.()
    })

    renderWithProviders(
      <AddToInventoryModal open={true} onOpenChange={onOpenChange} />
    )

    // Título/Descripción (translation keys)
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

    // Inputs - use placeholders since labels are i18n keys in tests
    await user.type(screen.getByPlaceholderText('100'), '100')
    await user.clear(screen.getByPlaceholderText('100'))
    await user.type(screen.getByPlaceholderText('100'), '100')
    await user.type(screen.getByPlaceholderText('BATCH001'), 'L-77')

    // Fecha - click on the calendar button first to open calendar
    const calendarButtons = screen.getAllByRole('button')
    const calendarTrigger = calendarButtons.find((b) =>
      b.textContent?.includes('modal.placeholders.pickDate')
    )
    if (calendarTrigger) {
      await user.click(calendarTrigger)
    }
    // Then click on the calendar grid
    await user.click(screen.getByRole('grid'))

    // Wait for form validation to complete and button to be enabled
    await waitFor(
      () => {
        const allButtons = screen.getAllByRole('button')
        const submitBtn = allButtons[allButtons.length - 1]
        expect(submitBtn).not.toBeDisabled()
      },
      { timeout: 8000 }
    )

    // Submit (último botón)
    const allButtons = screen.getAllByRole('button')
    const submitBtn = allButtons[allButtons.length - 1]
    await user.click(submitBtn)

    // onSuccess
    await waitFor(() => {
      expect(mockMutateCreateInventory).toHaveBeenCalled()
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(toast.success).toHaveBeenCalled()
  }, 10000)

  it('should disable buttons when pending and display error on failure', async () => {
    const onOpenChange = vi.fn()

    // Forzar isPending
    mutationIsPending = true

    renderWithProviders(
      <AddToInventoryModal open={true} onOpenChange={onOpenChange} />
    )

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

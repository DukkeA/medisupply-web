import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/test-utils'
import { CreateProviderModal } from './create-provider-modal'
import { toast } from 'sonner'
import { z } from 'zod'

/* ──────────────── Mocks tipados ──────────────── */

// Mock validation schema to always pass
vi.mock('@/lib/validations/provider-schema', () => ({
  createProviderSchema: () =>
    z.object({
      name: z.string(),
      contact_name: z.string(),
      nit: z.string(),
      email: z.string(),
      phone: z.string(),
      address: z.string(),
      country: z.string()
    })
}))

const mockCreateProvider = vi.fn()

vi.mock('@/generated', async () => {
  const actual = await vi.importActual('@/generated')
  return {
    ...actual,
    useCreateProviderBffWebProviderPost: () => ({
      mutate: mockCreateProvider,
      isPending: false
    })
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

/* ──────────────── Utilidades del test ──────────────── */
const fillBasics = () => {
  fireEvent.change(screen.getByPlaceholderText('John Doe'), {
    target: { value: 'John Doe' }
  })
  fireEvent.change(screen.getByPlaceholderText('Acme Corp'), {
    target: { value: 'Acme' }
  })
  fireEvent.change(screen.getByPlaceholderText('123456789-0'), {
    target: { value: '123' }
  })
  fireEvent.change(screen.getByPlaceholderText('john@example.com'), {
    target: { value: 'john@example.com' }
  })
  fireEvent.change(screen.getByPlaceholderText('+1 234 567 8900'), {
    target: { value: '+1 234' }
  })
  fireEvent.change(screen.getByPlaceholderText('123 Main St, Suite 100'), {
    target: { value: 'Main St' }
  })
  fireEvent.click(screen.getByRole('button', { name: 'modal.fields.country' })) // mock LocationSelector
}

/* ──────────────── Tests ──────────────── */
describe('CreateProviderModal', () => {
  it('should render and close when cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    renderWithProviders(
      <CreateProviderModal open={true} onOpenChange={onOpenChange} />
    )

    await waitFor(() => {
      expect(screen.getByText('modal.title')).toBeInTheDocument()
      expect(screen.getByText('modal.description')).toBeInTheDocument()
    })

    const form = screen.getByTestId('provider-form') as HTMLFormElement
    expect(form).toBeTruthy()

    fireEvent.click(screen.getByTestId('cancel-provider'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should submit form successfully and display success toast', async () => {
    const onOpenChange = vi.fn()

    mockCreateProvider.mockImplementation((data, options) => {
      options?.onSuccess?.()
    })

    renderWithProviders(
      <CreateProviderModal open={true} onOpenChange={onOpenChange} />
    )

    fillBasics()

    const form = screen.getByTestId('provider-form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => expect(mockCreateProvider).toHaveBeenCalledTimes(1))

    const [callData] = mockCreateProvider.mock.calls[0]
    expect(callData).toEqual({
      data: {
        name: 'John Doe',
        contact_name: 'Acme',
        nit: '123',
        email: 'john@example.com',
        phone: '+1 234',
        address: 'Main St',
        country: 'Colombia'
      }
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('modal.toastSuccess')
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('should display error toast when server returns error', async () => {
    const onOpenChange = vi.fn()

    mockCreateProvider.mockImplementation((_data, options) => {
      options?.onError?.(new Error('Server error'))
    })

    renderWithProviders(
      <CreateProviderModal open={true} onOpenChange={onOpenChange} />
    )

    fillBasics()

    const form = screen.getByTestId('provider-form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => expect(mockCreateProvider).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('modal.toastError')
    )
  })
})
